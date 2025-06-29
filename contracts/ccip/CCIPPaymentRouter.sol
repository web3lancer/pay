// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CCIPPaymentRouter
 * @notice Handles cross-chain payments for Web3Lancer using Chainlink CCIP
 */
contract CCIPPaymentRouter is CCIPReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct CrossChainPayment {
        address client;
        address freelancer;
        uint256 amount;
        address token;
        uint64 sourceChainSelector;
        uint64 destinationChainSelector;
        bytes32 messageId;
        PaymentStatus status;
        uint256 timestamp;
        uint256 milestoneId;
        address escrowContract;
    }

    enum PaymentStatus {
        Pending,
        InTransit,
        Completed,
        Failed,
        Disputed
    }

    // State variables
    mapping(bytes32 => CrossChainPayment) public crossChainPayments;
    mapping(uint64 => bool) public allowlistedChains;
    mapping(address => bool) public allowlistedTokens;
    mapping(address => uint256) public nonces;
    
    // Events
    event CrossChainPaymentInitiated(
        bytes32 indexed messageId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        address token,
        uint64 destinationChainSelector
    );
    
    event CrossChainPaymentReceived(
        bytes32 indexed messageId,
        address indexed client,
        address indexed freelancer,
        uint256 amount
    );
    
    event PaymentStatusUpdated(
        bytes32 indexed messageId,
        PaymentStatus status
    );

    modifier onlyAllowlistedChain(uint64 chainSelector) {
        require(allowlistedChains[chainSelector], "Chain not allowlisted");
        _;
    }

    modifier onlyAllowlistedToken(address token) {
        require(allowlistedTokens[token], "Token not allowlisted");
        _;
    }

    constructor(address _router) CCIPReceiver(_router) {}

    /**
     * @notice Initiate cross-chain payment
     */
    function initiateCrossChainPayment(
        address freelancer,
        uint256 amount,
        address token,
        uint64 destinationChainSelector,
        uint256 milestoneId,
        address destinationEscrow,
        uint256 gasLimit
    ) external payable onlyAllowlistedChain(destinationChainSelector) onlyAllowlistedToken(token) nonReentrant {
        require(freelancer != address(0), "Invalid freelancer address");
        require(amount > 0, "Amount must be greater than 0");
        require(destinationEscrow != address(0), "Invalid escrow address");

        // Transfer tokens from client
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Prepare CCIP message
        bytes memory data = abi.encode(
            msg.sender, // client
            freelancer,
            amount,
            milestoneId,
            block.timestamp,
            nonces[msg.sender]++
        );

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationEscrow),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](1),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: gasLimit})),
            feeToken: address(0) // Pay fees in native token
        });

        evm2AnyMessage.tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Calculate fee
        uint256 fees = IRouterClient(i_router).getFee(destinationChainSelector, evm2AnyMessage);
        require(msg.value >= fees, "Insufficient fee payment");

        // Approve router to spend tokens
        IERC20(token).safeApprove(i_router, amount);

        // Send message
        bytes32 messageId = IRouterClient(i_router).ccipSend{value: fees}(
            destinationChainSelector,
            evm2AnyMessage
        );

        // Store payment details
        crossChainPayments[messageId] = CrossChainPayment({
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            token: token,
            sourceChainSelector: 0, // Will be set when message is processed
            destinationChainSelector: destinationChainSelector,
            messageId: messageId,
            status: PaymentStatus.InTransit,
            timestamp: block.timestamp,
            milestoneId: milestoneId,
            escrowContract: destinationEscrow
        });

        emit CrossChainPaymentInitiated(
            messageId,
            msg.sender,
            freelancer,
            amount,
            token,
            destinationChainSelector
        );

        // Refund excess fees
        if (msg.value > fees) {
            payable(msg.sender).transfer(msg.value - fees);
        }
    }

    /**
     * @notice Handle incoming CCIP messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        bytes32 messageId = any2EvmMessage.messageId;
        
        // Decode message data
        (
            address client,
            address freelancer,
            uint256 amount,
            uint256 milestoneId,
            uint256 timestamp,
            uint256 nonce
        ) = abi.decode(any2EvmMessage.data, (address, address, uint256, uint256, uint256, uint256));

        // Process token transfer if included
        if (any2EvmMessage.tokenAmounts.length > 0) {
            Client.EVMTokenAmount memory tokenAmount = any2EvmMessage.tokenAmounts[0];
            
            // Update payment record
            crossChainPayments[messageId] = CrossChainPayment({
                client: client,
                freelancer: freelancer,
                amount: tokenAmount.amount,
                token: tokenAmount.token,
                sourceChainSelector: any2EvmMessage.sourceChainSelector,
                destinationChainSelector: 0,
                messageId: messageId,
                status: PaymentStatus.Completed,
                timestamp: timestamp,
                milestoneId: milestoneId,
                escrowContract: address(this)
            });

            emit CrossChainPaymentReceived(messageId, client, freelancer, tokenAmount.amount);
        }
    }

    /**
     * @notice Update payment status (admin only)
     */
    function updatePaymentStatus(bytes32 messageId, PaymentStatus status) external onlyOwner {
        require(crossChainPayments[messageId].messageId == messageId, "Payment not found");
        crossChainPayments[messageId].status = status;
        emit PaymentStatusUpdated(messageId, status);
    }

    /**
     * @notice Allowlist a chain for cross-chain payments
     */
    function allowlistChain(uint64 chainSelector) external onlyOwner {
        allowlistedChains[chainSelector] = true;
    }

    /**
     * @notice Allowlist a token for cross-chain payments
     */
    function allowlistToken(address token) external onlyOwner {
        allowlistedTokens[token] = true;
    }

    /**
     * @notice Remove chain from allowlist
     */
    function denylistChain(uint64 chainSelector) external onlyOwner {
        allowlistedChains[chainSelector] = false;
    }

    /**
     * @notice Remove token from allowlist
     */
    function denylistToken(address token) external onlyOwner {
        allowlistedTokens[token] = false;
    }

    /**
     * @notice Get payment details
     */
    function getPaymentDetails(bytes32 messageId) external view returns (CrossChainPayment memory) {
        return crossChainPayments[messageId];
    }

    /**
     * @notice Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @notice Estimate cross-chain payment fee
     */
    function estimatePaymentFee(
        address token,
        uint256 amount,
        uint64 destinationChainSelector,
        address destinationEscrow,
        uint256 gasLimit
    ) external view onlyAllowlistedChain(destinationChainSelector) returns (uint256) {
        bytes memory data = abi.encode(
            msg.sender,
            address(0), // placeholder freelancer
            amount,
            0, // placeholder milestoneId
            block.timestamp,
            0 // placeholder nonce
        );

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationEscrow),
            data: data,
            tokenAmounts: new Client.EVMTokenAmount[](1),
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: gasLimit})),
            feeToken: address(0)
        });

        evm2AnyMessage.tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        return IRouterClient(i_router).getFee(destinationChainSelector, evm2AnyMessage);
    }
}

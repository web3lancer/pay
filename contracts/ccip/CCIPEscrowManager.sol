// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./CCIPPaymentRouter.sol";
import "../interfaces/IEscrow.sol";
import {IERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CCIPEscrowManager
 * @notice Manages cross-chain escrow for received CCIP payments
 */
contract CCIPEscrowManager is IEscrow, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct CrossChainEscrow {
        address client;
        address freelancer;
        uint256 amount;
        address token;
        uint64 sourceChainSelector;
        bytes32 ccipMessageId;
        EscrowStatus status;
        uint256 createdAt;
        uint256 milestoneId;
        uint256 disputeDeadline;
    }

    enum EscrowStatus {
        Active,
        Released,
        Disputed,
        Refunded
    }

    // State variables
    mapping(bytes32 => CrossChainEscrow) public escrows;
    mapping(address => bool) public authorizedRouters;
    
    uint256 public constant DISPUTE_PERIOD = 7 days;
    address public arbitrator;

    // Events
    event CrossChainEscrowCreated(
        bytes32 indexed escrowId,
        address indexed client,
        address indexed freelancer,
        uint256 amount,
        address token,
        bytes32 ccipMessageId
    );

    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed freelancer,
        uint256 amount
    );

    event EscrowDisputed(
        bytes32 indexed escrowId,
        address indexed disputer
    );

    modifier onlyAuthorizedRouter() {
        require(authorizedRouters[msg.sender], "Unauthorized router");
        _;
    }

    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator");
        _;
    }

    constructor(address _arbitrator) {
        arbitrator = _arbitrator;
    }

    /**
     * @notice Create escrow from CCIP message (called by router)
     */
    function createCrossChainEscrow(
        address client,
        address freelancer,
        uint256 amount,
        address token,
        uint64 sourceChainSelector,
        bytes32 ccipMessageId,
        uint256 milestoneId
    ) external onlyAuthorizedRouter nonReentrant returns (bytes32) {
        bytes32 escrowId = keccak256(abi.encodePacked(
            ccipMessageId,
            client,
            freelancer,
            amount,
            block.timestamp
        ));

        escrows[escrowId] = CrossChainEscrow({
            client: client,
            freelancer: freelancer,
            amount: amount,
            token: token,
            sourceChainSelector: sourceChainSelector,
            ccipMessageId: ccipMessageId,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            milestoneId: milestoneId,
            disputeDeadline: block.timestamp + DISPUTE_PERIOD
        });

        emit CrossChainEscrowCreated(
            escrowId,
            client,
            freelancer,
            amount,
            token,
            ccipMessageId
        );

        return escrowId;
    }

    /**
     * @notice Release funds to freelancer
     */
    function releaseFunds(bytes32 escrowId) external override nonReentrant {
        CrossChainEscrow storage escrow = escrows[escrowId];
        require(escrow.amount > 0, "Escrow not found");
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.client || 
            (block.timestamp > escrow.disputeDeadline && msg.sender == escrow.freelancer),
            "Unauthorized release"
        );

        escrow.status = EscrowStatus.Released;
        
        IERC20(escrow.token).safeTransfer(escrow.freelancer, escrow.amount);

        emit EscrowReleased(escrowId, escrow.freelancer, escrow.amount);
    }

    /**
     * @notice Dispute the escrow
     */
    function disputeEscrow(bytes32 escrowId) external nonReentrant {
        CrossChainEscrow storage escrow = escrows[escrowId];
        require(escrow.amount > 0, "Escrow not found");
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Unauthorized dispute"
        );
        require(block.timestamp <= escrow.disputeDeadline, "Dispute period expired");

        escrow.status = EscrowStatus.Disputed;

        emit EscrowDisputed(escrowId, msg.sender);
    }

    /**
     * @notice Resolve dispute (arbitrator only)
     */
    function resolveDispute(
        bytes32 escrowId,
        address winner,
        uint256 clientAmount,
        uint256 freelancerAmount
    ) external onlyArbitrator nonReentrant {
        CrossChainEscrow storage escrow = escrows[escrowId];
        require(escrow.amount > 0, "Escrow not found");
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(clientAmount + freelancerAmount <= escrow.amount, "Invalid amounts");

        if (clientAmount > 0) {
            IERC20(escrow.token).safeTransfer(escrow.client, clientAmount);
        }
        
        if (freelancerAmount > 0) {
            IERC20(escrow.token).safeTransfer(escrow.freelancer, freelancerAmount);
        }

        // Handle remaining amount (arbitrator fee)
        uint256 remaining = escrow.amount - clientAmount - freelancerAmount;
        if (remaining > 0) {
            IERC20(escrow.token).safeTransfer(arbitrator, remaining);
        }

        escrow.status = winner == escrow.freelancer ? EscrowStatus.Released : EscrowStatus.Refunded;
    }

    /**
     * @notice Add authorized router
     */
    function addAuthorizedRouter(address router) external onlyArbitrator {
        authorizedRouters[router] = true;
    }

    /**
     * @notice Remove authorized router
     */
    function removeAuthorizedRouter(address router) external onlyArbitrator {
        authorizedRouters[router] = false;
    }

    /**
     * @notice Get escrow details
     */
    function getEscrowDetails(bytes32 escrowId) external view returns (CrossChainEscrow memory) {
        return escrows[escrowId];
    }

    // IEscrow interface implementation
    function deposit(uint256 milestoneId, address token, uint256 amount) external override {
        revert("Use createCrossChainEscrow instead");
    }

    function getEscrowStatus(uint256 milestoneId) external view override returns (uint8) {
        // This would need to be implemented based on milestone ID mapping
        return 0;
    }

    function getMilestoneDetails(uint256 milestoneId) external view override returns (
        address client,
        address freelancer,
        uint256 amount,
        address token,
        uint8 status,
        uint256 createdAt
    ) {
        // This would need to be implemented based on milestone ID mapping
        return (address(0), address(0), 0, address(0), 0, 0);
    }
}

import { Contract, formatEther, parseEther, TransactionResponse } from "ethers";
import { getMezoProvider } from "./providerService";
import { IERC20_ABI } from "@/integrations/mezo/contracts/abis/IERC20";

/**
 * Get balance of an ERC-20 token for a user
 * @param tokenAddress - Token contract address
 * @param userAddress - User wallet address
 * @param network - 'mainnet' or 'testnet'
 * @returns Balance as human-readable string (18 decimals)
 */
export const getTokenBalance = async (
  tokenAddress: string,
  userAddress: string,
  network?: "mainnet" | "testnet"
): Promise<string> => {
  const provider = getMezoProvider(network);
  const tokenContract = new Contract(tokenAddress, IERC20_ABI, provider);

  try {
    const balance = await tokenContract.balanceOf(userAddress);
    return formatEther(balance);
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
};

/**
 * Approve a spender to spend tokens on behalf of the user
 * NOTE: This requires a signer, so it's meant for client-side wallet interactions
 * @param tokenAddress - Token contract address
 * @param spenderAddress - Address to approve for spending
 * @param amount - Amount to approve (human-readable format)
 * @param signer - Ethers signer
 * @returns Transaction response
 */
export const approveToken = async (
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  signer: any
): Promise<TransactionResponse | null> => {
  const tokenContract = new Contract(tokenAddress, IERC20_ABI, signer);

  try {
    const parsedAmount = parseEther(amount);
    const tx = await tokenContract.approve(spenderAddress, parsedAmount);
    return tx;
  } catch (error) {
    console.error("Error approving token:", error);
    throw error;
  }
};

/**
 * Get allowance for a spender
 * @param tokenAddress - Token contract address
 * @param owner - Token owner address
 * @param spender - Spender address
 * @param network - 'mainnet' or 'testnet'
 * @returns Allowance as human-readable string
 */
export const getAllowance = async (
  tokenAddress: string,
  owner: string,
  spender: string,
  network?: "mainnet" | "testnet"
): Promise<string> => {
  const provider = getMezoProvider(network);
  const tokenContract = new Contract(tokenAddress, IERC20_ABI, provider);

  try {
    const allowance = await tokenContract.allowance(owner, spender);
    return formatEther(allowance);
  } catch (error) {
    console.error("Error fetching allowance:", error);
    throw error;
  }
};

/**
 * Transfer tokens to another address
 * NOTE: This requires a signer
 * @param tokenAddress - Token contract address
 * @param toAddress - Recipient address
 * @param amount - Amount to transfer (human-readable format)
 * @param signer - Ethers signer
 * @returns Transaction response
 */
export const transferToken = async (
  tokenAddress: string,
  toAddress: string,
  amount: string,
  signer: any
): Promise<TransactionResponse | null> => {
  const tokenContract = new Contract(tokenAddress, IERC20_ABI, signer);

  try {
    const parsedAmount = parseEther(amount);
    const tx = await tokenContract.transfer(toAddress, parsedAmount);
    return tx;
  } catch (error) {
    console.error("Error transferring token:", error);
    throw error;
  }
};

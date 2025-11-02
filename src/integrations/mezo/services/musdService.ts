import { Contract, formatEther, parseEther, TransactionResponse, ZeroAddress } from "ethers";
import { getMezoProvider } from "./providerService";
import { BORROWER_OPERATIONS_ABI } from "@/integrations/mezo/contracts/abis/BorrowerOperations";
import { getAddresses } from "@/integrations/mezo/contracts/addresses";
import { approveToken } from "./tokenService";

export interface Position {
  collateral: string;
  debt: string;
  healthFactor: number;
  ratio: number;
}

/**
 * Open a new MUSD borrowing position
 * @param collateralAmount - tBTC collateral amount (human-readable)
 * @param musdAmount - MUSD to borrow (human-readable)
 * @param signer - Ethers signer
 * @param network - 'mainnet' or 'testnet'
 * @returns Transaction response
 */
export const openPosition = async (
  collateralAmount: string,
  musdAmount: string,
  signer: any,
  network?: "mainnet" | "testnet"
): Promise<TransactionResponse | null> => {
  const addresses = getAddresses(network === "mainnet" ? "mainnet" : "testnet");
  const borrowerOpsAddress = addresses.BorrowerOperations || addresses.Portal;

  try {
    const parsedCollateral = parseEther(collateralAmount);
    const parsedMUSD = parseEther(musdAmount);
    const maxFeePercentage = parseEther("0.005");

    // Approve collateral first
    await approveToken(addresses.tBTC, borrowerOpsAddress, collateralAmount, signer);

    const borrowerOpsContract = new Contract(borrowerOpsAddress, BORROWER_OPERATIONS_ABI, signer);

    const tx = await borrowerOpsContract.openTrove(
      maxFeePercentage,
      parsedCollateral,
      parsedMUSD,
      ZeroAddress,
      ZeroAddress
    );

    return tx;
  } catch (error) {
    console.error("Error opening position:", error);
    throw error;
  }
};

/**
 * Repay MUSD debt
 * @param repayAmount - Amount of MUSD to repay (human-readable)
 * @param signer - Ethers signer
 * @param network - 'mainnet' or 'testnet'
 * @returns Transaction response
 */
export const repayMUSD = async (
  repayAmount: string,
  signer: any,
  network?: "mainnet" | "testnet"
): Promise<TransactionResponse | null> => {
  const addresses = getAddresses(network === "mainnet" ? "mainnet" : "testnet");
  const borrowerOpsAddress = addresses.BorrowerOperations || addresses.Portal;

  try {
    const parsedAmount = parseEther(repayAmount);
    const borrowerOpsContract = new Contract(borrowerOpsAddress, BORROWER_OPERATIONS_ABI, signer);

    const tx = await borrowerOpsContract.repayMUSD(parsedAmount, ZeroAddress, ZeroAddress);
    return tx;
  } catch (error) {
    console.error("Error repaying MUSD:", error);
    throw error;
  }
};

/**
 * Withdraw collateral from position
 * @param withdrawAmount - Amount of tBTC to withdraw (human-readable)
 * @param signer - Ethers signer
 * @param network - 'mainnet' or 'testnet'
 * @returns Transaction response
 */
export const withdrawCollateral = async (
  withdrawAmount: string,
  signer: any,
  network?: "mainnet" | "testnet"
): Promise<TransactionResponse | null> => {
  const addresses = getAddresses(network === "mainnet" ? "mainnet" : "testnet");
  const borrowerOpsAddress = addresses.BorrowerOperations || addresses.Portal;

  try {
    const parsedAmount = parseEther(withdrawAmount);
    const borrowerOpsContract = new Contract(borrowerOpsAddress, BORROWER_OPERATIONS_ABI, signer);

    const tx = await borrowerOpsContract.withdrawCollateral(parsedAmount, ZeroAddress, ZeroAddress);
    return tx;
  } catch (error) {
    console.error("Error withdrawing collateral:", error);
    throw error;
  }
};

export const getUserPosition = async (
  userAddress: string,
  network?: "mainnet" | "testnet"
): Promise<Position | null> => {
  if (!userAddress) return null;

  const provider = getMezoProvider(network);
  const addresses = getAddresses(network === "mainnet" ? "mainnet" : "testnet");
  const borrowerOpsAddress = addresses.BorrowerOperations || addresses.Portal;

  try {
    const borrowerOpsContract = new Contract(borrowerOpsAddress, BORROWER_OPERATIONS_ABI, provider);
    
    try {
      const [collateral, debt] = await borrowerOpsContract.getTrove(userAddress);

      const collateralStr = formatEther(collateral);
      const debtStr = formatEther(debt);

      // Calculate health factor (collateral / debt ratio)
      const collateralNum = parseFloat(collateralStr);
      const debtNum = parseFloat(debtStr);
      const healthFactor = debtNum === 0 ? 999 : collateralNum / debtNum;
      const ratio = debtNum === 0 ? 999 : (collateralNum / debtNum) * 100;

      return {
        collateral: collateralStr,
        debt: debtStr,
        healthFactor,
        ratio,
      };
    } catch (callError: any) {
      // User likely has no position yet - this is not an error
      if (callError?.reason?.includes("require(false)") || callError?.code === "CALL_EXCEPTION") {
        return null;
      }
      throw callError;
    }
  } catch (error: any) {
    console.error("Error fetching user position:", error?.message || error);
    return null;
  }
};

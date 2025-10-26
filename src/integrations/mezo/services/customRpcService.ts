import { getMezoProvider } from "./providerService";

export interface MezoCostEstimate {
  gasUnits: string;
  gasPrice: string;
  totalCost: string;
}

/**
 * Call the custom mezo_estimateCost RPC method
 * This provides more detailed cost estimation than standard eth_estimateGas
 * @param txArgs - Transaction arguments
 * @param network - 'mainnet' or 'testnet'
 * @returns Cost estimation result
 */
export const estimateCost = async (
  txArgs: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  },
  network?: "mainnet" | "testnet"
): Promise<Record<string, unknown>> => {
  const provider = getMezoProvider(network);

  try {
    const result = await provider.send("mezo_estimateCost", [txArgs]);
    return result;
  } catch (error) {
    console.error("Error calling mezo_estimateCost:", error);
    throw error;
  }
};

/**
 * Estimate gas for a transaction using standard eth_estimateGas
 * @param txArgs - Transaction arguments
 * @param network - 'mainnet' or 'testnet'
 * @returns Gas units required
 */
export const estimateGas = async (
  txArgs: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  },
  network?: "mainnet" | "testnet"
): Promise<string> => {
  const provider = getMezoProvider(network);

  try {
    const gasEstimate = await provider.estimateGas(txArgs);
    return gasEstimate.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
};

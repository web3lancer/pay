import { getCurrentNetwork } from "@/integrations/mezo/types/networks";

/**
 * Add Mezo network to wallet (MetaMask)
 * Requires window.ethereum to be available
 */
export const addMezoNetworkToWallet = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !window.ethereum) {
    console.error("MetaMask or Web3 wallet not available");
    return false;
  }

  const network = getCurrentNetwork();

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: network.chainIdHex,
          chainName: network.name,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.blockExplorer],
          nativeCurrency: {
            name: "Bitcoin",
            symbol: "BTC",
            decimals: 18,
          },
        },
      ],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4001) {
      console.log("User rejected adding network");
      return false;
    }
    console.error("Error adding network:", error);
    return false;
  }
};

/**
 * Switch to Mezo network
 */
export const switchToMezoNetwork = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !window.ethereum) {
    console.error("MetaMask or Web3 wallet not available");
    return false;
  }

  const network = getCurrentNetwork();

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainIdHex }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      return addMezoNetworkToWallet();
    }
    if (error.code === 4001) {
      console.log("User rejected network switch");
      return false;
    }
    console.error("Error switching network:", error);
    return false;
  }
};

/**
 * Get currently connected wallet address
 */
export const getConnectedAddress = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0] || null;
  } catch (error) {
    console.error("Error getting connected address:", error);
    return null;
  }
};

/**
 * Get current network chain ID from wallet
 */
export const getConnectedChainId = async (): Promise<number | null> => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  try {
    const chainIdHex = await window.ethereum.request({
      method: "eth_chainId",
    });
    return parseInt(chainIdHex, 16);
  } catch (error) {
    console.error("Error getting chain ID:", error);
    return null;
  }
};

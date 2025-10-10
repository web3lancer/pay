export function useWallet() {
  // Aptos wallet adapter removed to reduce dependencies
  // Returns stub implementation for compatibility
  return {
    address: null,
    connected: false,
    connect: async () => {
      console.warn('Aptos wallet adapter not configured');
    },
    disconnect: async () => {},
    signAndSubmitTransaction: async () => null,
    account: null,
    wallet: null,
  };
}

/**
 * Spectrum RPC Service
 * 
 * Integrates Spectrum RPCs for reliable, scalable, secure RPC and API solutions
 * Documentation: https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint
 * 
 * Spectrum provides:
 * - Reliable, scalable, secure RPC endpoints
 * - Free premium access during Mezo Hackathon
 * - High-performance API solutions
 * - Access form: https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint
 */

export interface SpectrumRpcConfig {
  name: string
  chainId: number
  url: string
  apiKey?: string
}

/**
 * Get Spectrum RPC configuration for given network
 * @param network - 'testnet' or 'mainnet'
 * @returns Spectrum RPC configuration
 */
export const getSpectrumRpcConfig = (network: 'testnet' | 'mainnet' = 'testnet'): SpectrumRpcConfig => {
  const url = network === 'mainnet'
    ? process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET
    : process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET

  const chainId = network === 'mainnet' ? 31612 : 31611
  const apiKey = process.env.NEXT_PUBLIC_SPECTRUM_API_KEY

  if (!url) {
    throw new Error(`Spectrum RPC URL not configured for ${network} network. Fill out the Spectrum Access Form at https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint`)
  }

  return {
    name: `Spectrum ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
    chainId,
    url,
    apiKey
  }
}

/**
 * Get Spectrum RPC endpoint with optional API key
 */
export const getSpectrumRpcUrl = (network: 'testnet' | 'mainnet' = 'testnet'): string => {
  const config = getSpectrumRpcConfig(network)
  
  if (config.apiKey) {
    return `${config.url}?apiKey=${config.apiKey}`
  }
  
  return config.url
}

/**
 * Check if Spectrum RPC is available for the given network
 */
export const isSpectrumRpcAvailable = (network: 'testnet' | 'mainnet' = 'testnet'): boolean => {
  try {
    const url = network === 'mainnet'
      ? process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET
      : process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET
    
    return !!url
  } catch {
    return false
  }
}

/**
 * Health check for Spectrum RPC endpoint
 * @param network - 'testnet' or 'mainnet'
 * @returns true if endpoint is responding
 */
export const checkSpectrumRpcHealth = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> => {
  try {
    const url = getSpectrumRpcUrl(network)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    })

    return response.ok
  } catch (error) {
    console.error(`Spectrum RPC health check failed for ${network}:`, error)
    return false
  }
}

/**
 * Boar Network RPC Service
 * 
 * Integrates Boar Network's upgraded free tier RPC access for Mezo
 * Documentation: https://boar.network/
 * 
 * Boar provides:
 * - HTTP and WebSocket endpoints
 * - Upgraded free tier access during Mezo Hackathon
 * - Fallback support for primary RPC failures
 */

export interface BoarRpcConfig {
  name: string
  chainId: number
  https: string
  wss?: string
  apiKey?: string
}

/**
 * Get Boar RPC configuration for given network
 * @param network - 'testnet' or 'mainnet'
 * @returns Boar RPC configuration
 */
export const getBoarRpcConfig = (network: 'testnet' | 'mainnet' = 'testnet'): BoarRpcConfig => {
  const httpsUrl = network === 'mainnet'
    ? process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS
    : process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS

  const wssUrl = network === 'mainnet'
    ? process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_WSS
    : process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_WSS

  const chainId = network === 'mainnet' ? 31612 : 31611
  const apiKey = process.env.NEXT_PUBLIC_BOAR_API_KEY

  if (!httpsUrl) {
    throw new Error(`Boar RPC URL not configured for ${network} network`)
  }

  return {
    name: `Boar ${network === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
    chainId,
    https: httpsUrl,
    wss: wssUrl,
    apiKey
  }
}

/**
 * Get Boar RPC HTTPS endpoint with optional API key
 */
export const getBoarRpcUrl = (network: 'testnet' | 'mainnet' = 'testnet'): string => {
  const config = getBoarRpcConfig(network)
  
  if (config.apiKey) {
    return `${config.https}?apiKey=${config.apiKey}`
  }
  
  return config.https
}

/**
 * Get Boar WebSocket endpoint with optional API key
 */
export const getBoarWssUrl = (network: 'testnet' | 'mainnet' = 'testnet'): string | undefined => {
  const config = getBoarRpcConfig(network)
  
  if (!config.wss) {
    return undefined
  }
  
  if (config.apiKey) {
    return `${config.wss}?apiKey=${config.apiKey}`
  }
  
  return config.wss
}

/**
 * Check if Boar RPC is available for the given network
 */
export const isBoarRpcAvailable = (network: 'testnet' | 'mainnet' = 'testnet'): boolean => {
  try {
    const httpsUrl = network === 'mainnet'
      ? process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS
      : process.env.NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS
    
    return !!httpsUrl
  } catch {
    return false
  }
}

/**
 * Health check for Boar RPC endpoint
 * @param network - 'testnet' or 'mainnet'
 * @returns true if endpoint is responding
 */
export const checkBoarRpcHealth = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> => {
  try {
    const url = getBoarRpcUrl(network)
    
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
    console.error(`Boar RPC health check failed for ${network}:`, error)
    return false
  }
}

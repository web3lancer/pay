/**
 * RPC Provider Manager
 * 
 * Manages multiple RPC providers with intelligent fallback logic:
 * 1. Spectrum (premium, reliable)
 * 2. Boar (backup, alternative)
 * 3. Default Mezo RPC (fallback)
 * 
 * Implements health checking and automatic fallback
 */

import { getSpectrumRpcUrl, isSpectrumRpcAvailable, checkSpectrumRpcHealth } from './spectrumRpcService'
import { getBoarRpcUrl, isBoarRpcAvailable, checkBoarRpcHealth } from './boarRpcService'

export interface RpcProvider {
  name: string
  url: string
  isAvailable: boolean
  priority: number
}

export interface RpcProviderConfig {
  network: 'testnet' | 'mainnet'
  providers: RpcProvider[]
  current: RpcProvider | null
}

/**
 * Get default RPC URL from Mezo config
 */
const getDefaultMezoRpc = (network: 'testnet' | 'mainnet' = 'testnet'): string => {
  if (network === 'mainnet') {
    return process.env.NEXT_PUBLIC_MEZO_RPC_MAINNET || 'https://mainnet.mezo.public.validationcloud.io/'
  }
  return process.env.NEXT_PUBLIC_MEZO_RPC_TESTNET || 'https://rpc.test.mezo.org'
}

/**
 * Build list of available RPC providers in priority order
 */
export const getAvailableRpcProviders = (network: 'testnet' | 'mainnet' = 'testnet'): RpcProvider[] => {
  const providers: RpcProvider[] = []

  // Priority 1: Spectrum (premium, reliable)
  if (isSpectrumRpcAvailable(network)) {
    providers.push({
      name: 'Spectrum',
      url: getSpectrumRpcUrl(network),
      isAvailable: true,
      priority: 1
    })
  }

  // Priority 2: Boar (backup, alternative)
  if (isBoarRpcAvailable(network)) {
    providers.push({
      name: 'Boar',
      url: getBoarRpcUrl(network),
      isAvailable: true,
      priority: 2
    })
  }

  // Priority 3: Default Mezo RPC (always available)
  providers.push({
    name: 'Mezo Default',
    url: getDefaultMezoRpc(network),
    isAvailable: true,
    priority: 3
  })

  return providers
}

/**
 * Get current active RPC provider (first available in priority order)
 */
export const getCurrentRpcProvider = (network: 'testnet' | 'mainnet' = 'testnet'): RpcProvider => {
  const providers = getAvailableRpcProviders(network)
  return providers[0]
}

/**
 * Get RPC URL with automatic fallback
 * Returns the URL of the first available provider
 */
export const getRpcUrl = (network: 'testnet' | 'mainnet' = 'testnet'): string => {
  const provider = getCurrentRpcProvider(network)
  return provider.url
}

/**
 * Get all RPC URLs for this network (for load balancing)
 */
export const getAllRpcUrls = (network: 'testnet' | 'mainnet' = 'testnet'): string[] => {
  const providers = getAvailableRpcProviders(network)
  return providers.map(p => p.url)
}

/**
 * Health check all RPC providers
 * Returns updated provider list with health status
 */
export const checkAllRpcProviderHealth = async (
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<RpcProvider[]> => {
  const providers = getAvailableRpcProviders(network)
  
  const healthChecks = await Promise.all(
    providers.map(async (provider) => {
      try {
        let isHealthy = false
        
        if (provider.name === 'Spectrum') {
          isHealthy = await checkSpectrumRpcHealth(network)
        } else if (provider.name === 'Boar') {
          isHealthy = await checkBoarRpcHealth(network)
        } else {
          // Default Mezo RPC - assume healthy if no error
          isHealthy = true
        }
        
        return {
          ...provider,
          isAvailable: isHealthy
        }
      } catch (error) {
        console.error(`Health check failed for ${provider.name}:`, error)
        return {
          ...provider,
          isAvailable: false
        }
      }
    })
  )

  return healthChecks.sort((a, b) => {
    // Sort by availability first, then by priority
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1
    }
    return a.priority - b.priority
  })
}

/**
 * Get RPC provider status for debugging
 */
export const getRpcProviderStatus = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<string> => {
  const providers = await checkAllRpcProviderHealth(network)
  
  const status = providers
    .map(p => `${p.name}: ${p.isAvailable ? '✓' : '✗'} (priority: ${p.priority})`)
    .join(' | ')
  
  return `[${network.toUpperCase()}] ${status}`
}

/**
 * Initialize RPC provider system
 * Performs initial health checks and logs status
 */
export const initializeRpcProviders = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<void> => {
  const status = await getRpcProviderStatus(network)
  console.log(`RPC Provider Status: ${status}`)
}

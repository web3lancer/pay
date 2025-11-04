/**
 * Spectrum GraphQL API Service
 * 
 * Integrates Spectrum's General Blockchain API for querying multiple blockchains
 * Documentation: https://spectrumnodes.gitbook.io/docs/developer-guides/apis/general-blockchain-api
 * 
 * Spectrum provides:
 * - Multi-chain blockchain queries (GraphQL)
 * - Supported methods: getBlockHeights, getBlockByNumber, getBlockByHash, getTransactionByHash, getAddressBalance, getBlockFee
 * - Support for 20+ blockchains with various support levels
 */

export interface SpectrumGraphqlConfig {
  endpoint: string
  network: 'testnet' | 'mainnet'
}

export interface BlockHeightResponse {
  chain: string
  height: string
  error: string | null
}

export interface BlockDetailsResponse {
  chain: string
  height: string | null
  hash: string | null
  block: Record<string, unknown> | null
  error: string | null
}

export interface TransactionDetailsResponse {
  chain: string
  hash: string | null
  transaction: Record<string, unknown> | null
  error: string | null
}

export interface AddressBalanceResponse {
  chain: string
  address: string
  token: string
  balance: string
  error: string | null
}

export interface BlockFeeResponse {
  chain: string
  baseFeePerGas: string
  maxPriorityFeePerGas: string
  error: string | null
}

/**
 * Get Spectrum GraphQL endpoint configuration
 * @param network - 'testnet' or 'mainnet'
 * @returns Spectrum GraphQL endpoint
 */
export const getSpectrumGraphqlConfig = (network: 'testnet' | 'mainnet' = 'testnet'): SpectrumGraphqlConfig => {
  const endpoint = network === 'mainnet'
    ? process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET
    : process.env.NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET

  if (!endpoint) {
    throw new Error(
      `Spectrum GraphQL endpoint not configured for ${network} network. ` +
      'Set NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET or NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET'
    )
  }

  return {
    endpoint,
    network
  }
}

/**
 * Execute a GraphQL query against Spectrum API
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @param network - 'testnet' or 'mainnet'
 * @returns GraphQL response data
 */
const executeGraphqlQuery = async (
  query: string,
  variables?: Record<string, unknown>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Record<string, unknown>> => {
  const config = getSpectrumGraphqlConfig(network)

  try {
    const response = await fetch(`${config.endpoint}graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: variables || {}
      })
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`)
    }

    return result.data || {}
  } catch (error) {
    console.error('Spectrum GraphQL query failed:', error)
    throw error
  }
}

/**
 * Get current block heights for specified chains
 * @param chains - Array of chain IDs (e.g., ['CHAIN_0X1', 'CHAIN_SOLANA_MAINNET'])
 * @param network - 'testnet' or 'mainnet'
 * @returns Block height responses
 */
export const getBlockHeights = async (
  chains: string[],
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<BlockHeightResponse[]> => {
  const query = `
    query GetBlockHeights($chains: [String!]!) {
      getBlockHeights(chains: $chains) {
        chain
        height
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { chains }, network)
  return (result.getBlockHeights as BlockHeightResponse[]) || []
}

/**
 * Get block by number for specified chains
 * @param input - Array of { chain, block } objects
 * @param network - 'testnet' or 'mainnet'
 * @returns Block details responses
 */
export const getBlockByNumber = async (
  input: Array<{ chain: string; block: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<BlockDetailsResponse[]> => {
  const query = `
    query GetBlockByNumber($input: [ChainBlockNumberInput!]!) {
      getBlockByNumber(input: $input) {
        chain
        height
        hash
        block {
          ... on EVMBlockDetails {
            chain
            baseFeePerGas
            blobGasUsed
            gasUsed
            hash
            number
          }
          ... on BitcoinBlockDetails {
            chain
            hash
            confirmations
            merkleroot
            previousblockhash
          }
          ... on SolanaBlockDetails {
            chain
            blockHeight
            blockTime
            blockhash
            parentSlot
            previousBlockhash
          }
          ... on TendermintBlockDetails {
            chain
            header {
              version {
                block
                app
              }
              chain_id
              height
              time
            }
          }
        }
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { input }, network)
  return (result.getBlockByNumber as BlockDetailsResponse[]) || []
}

/**
 * Get block by hash for specified chains
 * @param input - Array of { chain, hash } objects
 * @param network - 'testnet' or 'mainnet'
 * @returns Block details responses
 */
export const getBlockByHash = async (
  input: Array<{ chain: string; hash: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<BlockDetailsResponse[]> => {
  const query = `
    query GetBlockByHash($input: [ChainHashInput!]!) {
      getBlockByHash(input: $input) {
        chain
        hash
        block {
          ... on EVMBlockDetails {
            chain
            baseFeePerGas
            blobGasUsed
            gasUsed
            hash
            number
          }
          ... on BitcoinBlockDetails {
            chain
            hash
            confirmations
            merkleroot
            previousblockhash
          }
          ... on SolanaBlockDetails {
            chain
            blockHeight
            blockTime
            blockhash
            parentSlot
            previousBlockhash
          }
          ... on TendermintBlockDetails {
            chain
            header {
              version {
                block
                app
              }
              chain_id
              height
              time
            }
          }
        }
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { input }, network)
  return (result.getBlockByHash as BlockDetailsResponse[]) || []
}

/**
 * Get transaction by hash for specified chains
 * @param input - Array of { chain, hash } objects
 * @param network - 'testnet' or 'mainnet'
 * @returns Transaction details responses
 */
export const getTransactionByHash = async (
  input: Array<{ chain: string; hash: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<TransactionDetailsResponse[]> => {
  const query = `
    query GetTransactionByHash($input: [ChainHashInput!]!) {
      getTransactionByHash(input: $input) {
        chain
        hash
        transaction {
          ... on EVMTransactionDetails {
            chain
            blockHash
            blockNumber
            from
            gas
            gasPrice
            maxPriorityFeePerGas
            maxFeePerGas
            hash
          }
          ... on SolanaTransactionDetails {
            chain
            blockTime
            meta {
              computeUnitsConsumed
              err
              fee
            }
          }
          ... on TendermintTransactionDetails {
            chain
            tx_response {
              gas_used
              gas_wanted
              timestamp
              code
              txhash
            }
          }
        }
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { input }, network)
  return (result.getTransactionByHash as TransactionDetailsResponse[]) || []
}

/**
 * Get address balance for specified chains and tokens
 * @param input - Array of { chain, address, token } objects
 * @param network - 'testnet' or 'mainnet'
 * @returns Address balance responses
 */
export const getAddressBalance = async (
  input: Array<{ chain: string; address: string; token: string }>,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<AddressBalanceResponse[]> => {
  const query = `
    query GetAddressBalance($input: [ChainAddressTokenInput!]!) {
      getAddressBalance(input: $input) {
        chain
        address
        token
        balance
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { input }, network)
  return (result.getAddressBalance as AddressBalanceResponse[]) || []
}

/**
 * Get block fees (base fee and max priority fee) for specified chains
 * @param chains - Array of chain IDs
 * @param network - 'testnet' or 'mainnet'
 * @returns Block fee responses
 */
export const getBlockFee = async (
  chains: string[],
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<BlockFeeResponse[]> => {
  const query = `
    query GetBlockFee($chains: [String!]!) {
      getBlockFee(chains: $chains) {
        chain
        baseFeePerGas
        maxPriorityFeePerGas
        error
      }
    }
  `

  const result = await executeGraphqlQuery(query, { chains }, network)
  return (result.getBlockFee as BlockFeeResponse[]) || []
}

/**
 * Check if Spectrum GraphQL API is available
 * @param network - 'testnet' or 'mainnet'
 * @returns true if available
 */
export const isSpectrumGraphqlAvailable = (network: 'testnet' | 'mainnet' = 'testnet'): boolean => {
  try {
    getSpectrumGraphqlConfig(network)
    return true
  } catch {
    return false
  }
}

/**
 * Health check for Spectrum GraphQL endpoint
 * @param network - 'testnet' or 'mainnet'
 * @returns true if endpoint is responding
 */
export const checkSpectrumGraphqlHealth = async (network: 'testnet' | 'mainnet' = 'testnet'): Promise<boolean> => {
  try {
    const result = await getBlockHeights(['CHAIN_0X1'], network)
    return result && result.length > 0 && !result[0].error
  } catch (error) {
    console.error(`Spectrum GraphQL health check failed for ${network}:`, error)
    return false
  }
}

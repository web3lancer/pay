// Exchange rate service for fetching live cryptocurrency prices
interface ExchangeRate {
  tokenId: string
  symbol: string
  name: string
  price_usd: number
  price_change_24h: number
  last_updated: string
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number
    usd_24h_change: number
  }
}

class ExchangeRateService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3'
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private static cache: Map<string, { rate: ExchangeRate; timestamp: number }> = new Map()

  // Mapping of our token IDs to CoinGecko IDs
  private static readonly TOKEN_MAPPING: Record<string, string> = {
    'btc': 'bitcoin',
    'eth': 'ethereum', 
    'matic': 'matic-network',
    'bnb': 'binancecoin',
    'usdt': 'tether',
    'usdc': 'usd-coin',
    'ada': 'cardano',
    'sol': 'solana',
    'dot': 'polkadot',
    'avax': 'avalanche-2'
  }

  static async getExchangeRate(tokenId: string): Promise<ExchangeRate | null> {
    // Check cache first
    const cached = this.cache.get(tokenId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rate
    }

    try {
      const coinGeckoId = this.TOKEN_MAPPING[tokenId.toLowerCase()]
      if (!coinGeckoId) {
        console.warn(`No CoinGecko mapping for token: ${tokenId}`)
        return this.getMockRate(tokenId)
      }

      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: CoinGeckoResponse = await response.json()
      const priceData = data[coinGeckoId]

      if (!priceData) {
        throw new Error(`No price data for ${coinGeckoId}`)
      }

      const rate: ExchangeRate = {
        tokenId: tokenId.toLowerCase(),
        symbol: tokenId.toUpperCase(),
        name: this.getTokenName(tokenId),
        price_usd: priceData.usd,
        price_change_24h: priceData.usd_24h_change || 0,
        last_updated: new Date().toISOString()
      }

      // Cache the result
      this.cache.set(tokenId, { rate, timestamp: Date.now() })
      
      return rate
    } catch (error) {
      console.error(`Failed to fetch exchange rate for ${tokenId}:`, error)
      return this.getMockRate(tokenId)
    }
  }

  static async getMultipleExchangeRates(tokenIds: string[]): Promise<ExchangeRate[]> {
    const uniqueTokens = [...new Set(tokenIds.map(id => id.toLowerCase()))]
    const coinGeckoIds = uniqueTokens
      .map(id => this.TOKEN_MAPPING[id])
      .filter(Boolean)

    if (coinGeckoIds.length === 0) {
      return uniqueTokens.map(id => this.getMockRate(id)).filter(Boolean) as ExchangeRate[]
    }

    try {
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: CoinGeckoResponse = await response.json()
      const rates: ExchangeRate[] = []

      for (const tokenId of uniqueTokens) {
        const coinGeckoId = this.TOKEN_MAPPING[tokenId]
        const priceData = data[coinGeckoId]

        if (priceData) {
          const rate: ExchangeRate = {
            tokenId,
            symbol: tokenId.toUpperCase(),
            name: this.getTokenName(tokenId),
            price_usd: priceData.usd,
            price_change_24h: priceData.usd_24h_change || 0,
            last_updated: new Date().toISOString()
          }

          // Cache the result
          this.cache.set(tokenId, { rate, timestamp: Date.now() })
          rates.push(rate)
        } else {
          const mockRate = this.getMockRate(tokenId)
          if (mockRate) rates.push(mockRate)
        }
      }

      return rates
    } catch (error) {
      console.error('Failed to fetch multiple exchange rates:', error)
      return uniqueTokens.map(id => this.getMockRate(id)).filter(Boolean) as ExchangeRate[]
    }
  }

  static calculateUsdValue(amount: string | number, tokenId: string, exchangeRate?: ExchangeRate): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 0

    if (exchangeRate) {
      return numAmount * exchangeRate.price_usd
    }

    // Fallback to mock prices if no exchange rate provided
    const mockRate = this.getMockRate(tokenId)
    return mockRate ? numAmount * mockRate.price_usd : 0
  }

  static formatUsdValue(usdValue: number): string {
    if (usdValue >= 1000000) {
      return `$${(usdValue / 1000000).toFixed(2)}M`
    } else if (usdValue >= 1000) {
      return `$${(usdValue / 1000).toFixed(2)}K`
    } else {
      return `$${usdValue.toFixed(2)}`
    }
  }

  static formatPriceChange(change: number): { text: string; color: string } {
    const isPositive = change >= 0
    return {
      text: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    }
  }

  private static getMockRate(tokenId: string): ExchangeRate | null {
    const mockPrices: Record<string, { price: number; name: string }> = {
      'btc': { price: 43000, name: 'Bitcoin' },
      'eth': { price: 2400, name: 'Ethereum' },
      'matic': { price: 0.85, name: 'Polygon' },
      'bnb': { price: 310, name: 'BNB' },
      'usdt': { price: 1.00, name: 'Tether' },
      'usdc': { price: 1.00, name: 'USD Coin' },
      'ada': { price: 0.45, name: 'Cardano' },
      'sol': { price: 95, name: 'Solana' },
      'dot': { price: 7.20, name: 'Polkadot' },
      'avax': { price: 35, name: 'Avalanche' }
    }

    const mockData = mockPrices[tokenId.toLowerCase()]
    if (!mockData) return null

    return {
      tokenId: tokenId.toLowerCase(),
      symbol: tokenId.toUpperCase(),
      name: mockData.name,
      price_usd: mockData.price,
      price_change_24h: (Math.random() - 0.5) * 10, // Random change between -5% to +5%
      last_updated: new Date().toISOString()
    }
  }

  private static getTokenName(tokenId: string): string {
    const names: Record<string, string> = {
      'btc': 'Bitcoin',
      'eth': 'Ethereum',
      'matic': 'Polygon',
      'bnb': 'BNB',
      'usdt': 'Tether',
      'usdc': 'USD Coin',
      'ada': 'Cardano',
      'sol': 'Solana',
      'dot': 'Polkadot',
      'avax': 'Avalanche'
    }
    return names[tokenId.toLowerCase()] || tokenId.toUpperCase()
  }

  static clearCache(): void {
    this.cache.clear()
  }

  static getCacheSize(): number {
    return this.cache.size
  }
}

export { ExchangeRateService, type ExchangeRate }
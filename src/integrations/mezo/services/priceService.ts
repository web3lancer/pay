let btcPriceCache = { price: 50000, timestamp: 0 };
const CACHE_TTL = 60000; // 60 seconds

/**
 * Get current BTC price from CoinGecko API
 * Includes caching to avoid rate limiting
 * @returns BTC price in USD
 */
export const getBTCPrice = async (): Promise<number> => {
  const now = Date.now();

  // Return cached price if still valid
  if (btcPriceCache.price && now - btcPriceCache.timestamp < CACHE_TTL) {
    return btcPriceCache.price;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    );

    if (!response.ok) {
      console.warn("Failed to fetch BTC price, using cached value");
      return btcPriceCache.price;
    }

    const data = await response.json();
    const price = data.bitcoin?.usd || btcPriceCache.price;

    // Update cache
    btcPriceCache = { price, timestamp: now };
    return price;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    // Return cached price or fallback
    return btcPriceCache.price || 50000;
  }
};

/**
 * Clear price cache
 */
export const clearPriceCache = (): void => {
  btcPriceCache = { price: 50000, timestamp: 0 };
};

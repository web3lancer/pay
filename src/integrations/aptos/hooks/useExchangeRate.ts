import { useQuery } from '@tanstack/react-query';

// Replace with actual Aptos client logic
async function fetchExchangeRate(fromCurrency: string, toCurrency: string) {
  // return aptosClient().view({ function: `${MODULE_ADDRESS}::exchange_rate::get_exchange_rate`, arguments: [fromCurrency, toCurrency] });
  return {};
}

export function useExchangeRate(fromCurrency: string, toCurrency: string) {
  return useQuery({
    queryKey: ["exchangeRate", fromCurrency, toCurrency],
    queryFn: () => fetchExchangeRate(fromCurrency, toCurrency),
    enabled: !!fromCurrency && !!toCurrency,
  });
}

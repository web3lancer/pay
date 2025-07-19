import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';

// Replace with actual Aptos client logic
async function fetchPaymentRequest(address: string) {
  // return aptosClient().view({ function: `${MODULE_ADDRESS}::payment_request::get_payment_request`, arguments: [address] });
  return {};
}

export function usePaymentRequest(address: string) {
  return useQuery({
    queryKey: ["paymentRequest", address],
    queryFn: () => fetchPaymentRequest(address),
    enabled: !!address,
  });
}

export function useCreatePaymentRequest() {
  return useMutation({
    mutationFn: async (args: any) => {
      // return aptosClient().submitTransaction({ function: `${MODULE_ADDRESS}::payment_request::create_payment_request`, arguments: [...] });
      return {};
    },
  });
}

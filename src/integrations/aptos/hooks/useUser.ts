import { MODULE_ADDRESS } from '@/integrations/aptos/constants';
import { aptosClient } from '@/integrations/aptos/utils/aptosClient';
import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';

// Correct payload for Aptos SDK view function
async function fetchUser(_address: string) {
  return aptosClient().view({
    payload: {
      function: `${MODULE_ADDRESS}::user::get_user`,
    //   arguments: [address], // <-- use 'arguments', not 'args'
    },
  });
}

export function useUser(address: string) {
  return useQuery({
    queryKey: ["user", address],
    queryFn: () => fetchUser(address),
    enabled: !!address,
  });
}

// Mutation example (create/update/delete)
export function useCreateUser() {
  return useMutation({
    mutationFn: async (_args: any) => {
      // Use correct payload structure for transactions too
      // return aptosClient().submitTransaction({ payload: { function: `${MODULE_ADDRESS}::user::create_user`, arguments: [...] } });
      return {}; // placeholder
    },
  });
}

import {
  useMutation,
  useQuery,
} from '@tanstack/react-query';

// Replace with actual Aptos client logic
async function fetchUser(address: string) {
  // e.g. call view function
  return aptosClient().view({ function: `${MODULE_ADDRESS}::user::get_user`, arguments: [address] });
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
    mutationFn: async (args: any) => {
      // e.g. call entry function
      // return aptosClient().submitTransaction({ function: `${MODULE_ADDRESS}::user::create_user`, arguments: [...] });
      return {}; // placeholder
    },
  });
}
}

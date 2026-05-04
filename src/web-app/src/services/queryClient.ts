import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";


export const queryClient = new QueryClient({
  queryCache: new QueryCache({}),

  mutationCache: new MutationCache({}),

  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

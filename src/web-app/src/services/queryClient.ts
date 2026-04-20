import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Помилка завантаження';
            toast.error(message);
        },
    }),

    mutationCache: new MutationCache({
        onError: (error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Сталася невідома помилка';
            toast.error(errorMessage);
        },
    }),

    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

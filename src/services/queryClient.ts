/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: any) => {
        // don't retry on 401/403
        const status = (error as any)?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 0,
      // No global error handling - let individual mutations handle their own errors
      onError: () => {
        // Individual mutations will handle their own error messages
      },
      onSuccess: () => {
        // No default success toast; leave to per-mutation logic.
      },
    },
  },
});

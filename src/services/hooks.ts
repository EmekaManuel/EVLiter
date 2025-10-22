import { setAccessToken } from "@/utils/token";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/services/api";
import { demoApi } from "@/services/api";
import { notify } from "@/lib/utils";
import { toast } from "sonner";

// Example: get current user profile
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: authApi.me,
  });
}

// Example: sign-in mutation that stores token
export function useSignIn() {
  return useMutation({
    mutationFn: authApi.signIn,
    onSuccess: ({ accessToken }) => {
      if (accessToken) setAccessToken(accessToken);
      notify.success("Signed in", "Welcome back!");
    },
  });
}

// Demo/test hooks for toasts + react-query
export function useRandomFail() {
  return useQuery({
    queryKey: ["demo", "random-fail"],
    queryFn: demoApi.randomFail,
    retry: 0,
  });
}

export function useEchoMutation() {
  type EchoVariables = Record<string, unknown>;
  type EchoResponse = { received: Record<string, unknown>; message: string };
  type EchoContext = { toastId: string | number } | undefined;

  return useMutation<EchoResponse, unknown, EchoVariables, EchoContext>({
    mutationFn: (vars) => demoApi.echo(vars),
    onMutate: () => {
      const id = notify.loading("Sending...");
      return { toastId: id };
    },
    onSuccess: (_data, _vars, context) => {
      if (context?.toastId) {
        toast.success("Success", { id: context.toastId });
      } else {
        notify.success("Success", "Transaction echoed.");
      }
    },
    onError: (_error, _vars, context) => {
      if (context?.toastId) notify.dismiss(context.toastId);
      // Global mutation onError will display the error toast
    },
  });
}

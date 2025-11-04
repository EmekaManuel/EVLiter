import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/services/api/modules/auth";
import { notify, getErrorMessage } from "@/lib/utils";

// ============================================
// Auth Queries
// ============================================

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.me,
    staleTime: 60_000, // 1 minute
    retry: false, // Don't retry on 401
  });
}

// ============================================
// Auth Mutations
// ============================================

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onMutate: async () => {
      const loadingId = notify.loading("Creating your account...");
      return { loadingId };
    },
    onSuccess: (data, _, context) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Account created", "Welcome! You can now sign in");
      return data;
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to create account", getErrorMessage(error));
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onMutate: async () => {
      const loadingId = notify.loading("Signing in...");
      return { loadingId };
    },
    onSuccess: (data, _, context) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Welcome back!", "You've been signed in successfully");
      return data;
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Sign in failed", getErrorMessage(error));
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: ({ refreshToken }: { refreshToken: string }) =>
      authApi.refresh(refreshToken),
    // Silent refresh - no notification needed
    onError: () => {
      // Only show error if refresh fails critically
      notify.error("Session expired", "Please sign in again");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onMutate: async () => {
      const loadingId = notify.loading("Signing out...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.clear(); // Clear all queries on logout
      queryClient.setQueryData(["auth", "me"], null);
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Signed out", "You've been signed out successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to sign out", getErrorMessage(error));
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onMutate: async () => {
      const loadingId = notify.loading("Updating profile...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Profile updated", "Your changes have been saved");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to update profile", getErrorMessage(error));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onMutate: async () => {
      const loadingId = notify.loading("Changing password...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Password changed", "Your password has been updated");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to change password", getErrorMessage(error));
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => authApi.forgotPassword(email),
    onMutate: async () => {
      const loadingId = notify.loading("Sending reset email...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Reset email sent",
        "Check your inbox for password reset instructions"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to send reset email", getErrorMessage(error));
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
    onMutate: async () => {
      const loadingId = notify.loading("Resetting password...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Password reset",
        "Your password has been reset successfully"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to reset password", getErrorMessage(error));
    },
  });
}

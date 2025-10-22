import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Toast helpers
import { toast } from "sonner";

export const notify = {
  loading(message: string, description?: string): string | number {
    return toast.loading(message, description ? { description } : undefined);
  },
  success(message: string, description?: string) {
    toast.success(message, description ? { description } : undefined);
  },
  error(message: string, description?: string) {
    toast.error(message, description ? { description } : undefined);
  },
  info(message: string, description?: string) {
    toast(message, description ? { description } : undefined);
  },
  dismiss(id: string | number) {
    toast.dismiss(id);
  },
  promise<T>(
    p: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) {
    return toast.promise(p, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};

// Extract an error message from Axios/Fetch/unknown errors
export function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maybeAxios: any = error as any;
  const axiosMsg = maybeAxios?.response?.data?.message || maybeAxios?.message;
  if (typeof axiosMsg === "string" && axiosMsg.trim().length > 0)
    return axiosMsg;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

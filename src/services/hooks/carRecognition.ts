import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as carRecognitionApi from "@/services/api/modules/carRecognition";
import { notify, getErrorMessage } from "@/lib/utils";

// ============================================
// Car Recognition Queries
// ============================================

export function useCarRecognitionHistory(
  params?: carRecognitionApi.GetUserRecognitionsParams
) {
  return useQuery({
    queryKey: ["car-recognition", "history", params ?? {}],
    queryFn: () => carRecognitionApi.getUserRecognitions(params),
    staleTime: 60_000, // 1 minute
  });
}

// ============================================
// Car Recognition Mutations
// ============================================

export function useRecognizeCarByVIN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: carRecognitionApi.recognizeCarByVIN,
    onMutate: async () => {
      const loadingId = notify.loading("Recognizing vehicle by VIN...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: ["car-recognition", "history"],
      });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Vehicle recognized",
        "Car details retrieved successfully"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to recognize vehicle", getErrorMessage(error));
    },
  });
}

export function useRecognizeCarByModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: carRecognitionApi.recognizeCarByModel,
    onMutate: async () => {
      const loadingId = notify.loading("Recognizing vehicle by model...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({
        queryKey: ["car-recognition", "history"],
      });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success(
        "Vehicle recognized",
        "Car details retrieved successfully"
      );
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error("Failed to recognize vehicle", getErrorMessage(error));
    },
  });
}

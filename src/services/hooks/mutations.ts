import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify, getErrorMessage } from "@/lib/utils";
import * as authApi from "@/services/api/modules/auth";
import * as companyApi from "@/services/api/modules/company";
import * as billingApi from "@/services/api/modules/billing";
import * as devicesApi from "@/services/api/modules/devices";
import * as transactionsApi from "@/services/api/modules/transactions";
import * as settlementsApi from "@/services/api/modules/settlements";
import * as invoicesApi from "@/services/api/modules/invoices";
import * as pricingApi from "@/services/api/modules/pricing";
import * as classifiersApi from "@/services/api/modules/classifiers";

// Auth Mutations
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.createUser,
    onMutate: async () => {
      const loadingId = notify.loading("Creating user...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("User created successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to create user: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: authApi.UpdateUserPayload;
    }) => authApi.updateUser(userId, payload),
    onMutate: async () => {
      const loadingId = notify.loading("Updating user...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("User updated successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to update user: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.deleteUser,
    onMutate: async () => {
      const loadingId = notify.loading("Deleting user...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("User deleted successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to delete user: ${getErrorMessage(error)}`);
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
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["company", "profile"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Profile updated successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to update profile: ${getErrorMessage(error)}`);
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
      notify.success("Password changed successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to change password: ${getErrorMessage(error)}`);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onMutate: async () => {
      const loadingId = notify.loading("Sending reset email...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Password reset email sent");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to send reset email: ${getErrorMessage(error)}`);
    },
  });
}

// Company Mutations
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.createCompany,
    onMutate: async () => {
      const loadingId = notify.loading("Creating company...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Company created successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to create company: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.updateCompany,
    onMutate: async () => {
      const loadingId = notify.loading("Updating company...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Company updated successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to update company: ${getErrorMessage(error)}`);
    },
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.createStore,
    onMutate: async () => {
      const loadingId = notify.loading("Creating store...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Store created successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to create store: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      payload,
    }: {
      storeId: string;
      payload: companyApi.UpdateStorePayload;
    }) => companyApi.updateStore(storeId, payload),
    onMutate: async () => {
      const loadingId = notify.loading("Updating store...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Store updated successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to update store: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyApi.deleteStore,
    onMutate: async () => {
      const loadingId = notify.loading("Deleting store...");
      return { loadingId };
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.success("Store deleted successfully");
    },
    onError: (error, _, context) => {
      if (context?.loadingId) {
        notify.dismiss(context.loadingId);
      }
      notify.error(`Failed to delete store: ${getErrorMessage(error)}`);
    },
  });
}

// Device Mutations
export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notify.success("Device created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create device: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      deviceId,
      payload,
    }: {
      deviceId: string;
      payload: devicesApi.UpdateDevicePayload;
    }) => devicesApi.updateDevice(deviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notify.success("Device updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update device: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notify.success("Device deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete device: ${getErrorMessage(error)}`);
    },
  });
}

export function usePairDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.pairDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notify.success("Device paired successfully");
    },
    onError: (error) => {
      notify.error(`Failed to pair device: ${getErrorMessage(error)}`);
    },
  });
}

export function useRestartDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: devicesApi.restartDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      notify.success("Device restart initiated");
    },
    onError: (error) => {
      notify.error(`Failed to restart device: ${getErrorMessage(error)}`);
    },
  });
}

// Transaction Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      notify.success("Transaction created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create transaction: ${getErrorMessage(error)}`);
    },
  });
}

export function useRefundTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.refundTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      notify.success("Refund processed successfully");
    },
    onError: (error) => {
      notify.error(`Failed to process refund: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      payload,
    }: {
      transactionId: string;
      payload: transactionsApi.UpdateTransactionPayload;
    }) => transactionsApi.updateTransaction(transactionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      notify.success("Transaction updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update transaction: ${getErrorMessage(error)}`);
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.cancelTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      notify.success("Transaction cancelled successfully");
    },
    onError: (error) => {
      notify.error(`Failed to cancel transaction: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      notify.success("Transaction deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete transaction: ${getErrorMessage(error)}`);
    },
  });
}

// Billing Mutations
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Payment method added successfully");
    },
    onError: (error) => {
      notify.error(`Failed to add payment method: ${getErrorMessage(error)}`);
    },
  });
}

export function useMakePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.makePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Payment processed successfully");
    },
    onError: (error) => {
      notify.error(`Failed to process payment: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentMethodId,
      payload,
    }: {
      paymentMethodId: string;
      payload: billingApi.UpdatePaymentMethodPayload;
    }) => billingApi.updatePaymentMethod(paymentMethodId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Payment method updated successfully");
    },
    onError: (error) => {
      notify.error(
        `Failed to update payment method: ${getErrorMessage(error)}`
      );
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Payment method deleted successfully");
    },
    onError: (error) => {
      notify.error(
        `Failed to delete payment method: ${getErrorMessage(error)}`
      );
    },
  });
}

export function useUpdateBillingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.updateBillingSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Billing settings updated successfully");
    },
    onError: (error) => {
      notify.error(
        `Failed to update billing settings: ${getErrorMessage(error)}`
      );
    },
  });
}

// Settlement Mutations
export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settlementsApi.createSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create settlement: ${getErrorMessage(error)}`);
    },
  });
}

export function useRequestSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settlementsApi.requestSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement requested successfully");
    },
    onError: (error) => {
      notify.error(`Failed to request settlement: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settlementId,
      payload,
    }: {
      settlementId: string;
      payload: settlementsApi.UpdateSettlementPayload;
    }) => settlementsApi.updateSettlement(settlementId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update settlement: ${getErrorMessage(error)}`);
    },
  });
}

export function useRetrySettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settlementsApi.retrySettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement retry initiated");
    },
    onError: (error) => {
      notify.error(`Failed to retry settlement: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settlementsApi.deleteSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete settlement: ${getErrorMessage(error)}`);
    },
  });
}

export function useCancelSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settlementsApi.cancelSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      notify.success("Settlement cancelled successfully");
    },
    onError: (error) => {
      notify.error(`Failed to cancel settlement: ${getErrorMessage(error)}`);
    },
  });
}

// Invoice Mutations
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create invoice: ${getErrorMessage(error)}`);
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesApi.sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice sent successfully");
    },
    onError: (error) => {
      notify.error(`Failed to send invoice: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: invoicesApi.UpdateInvoicePayload;
    }) => invoicesApi.updateInvoice(invoiceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update invoice: ${getErrorMessage(error)}`);
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesApi.markInvoicePaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice marked as paid");
    },
    onError: (error) => {
      notify.error(`Failed to mark invoice as paid: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesApi.deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete invoice: ${getErrorMessage(error)}`);
    },
  });
}

export function useVoidInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesApi.voidInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notify.success("Invoice voided successfully");
    },
    onError: (error) => {
      notify.error(`Failed to void invoice: ${getErrorMessage(error)}`);
    },
  });
}

// Pricing Mutations
export function useCreatePricingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingApi.createPricingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      notify.success("Pricing plan created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create pricing plan: ${getErrorMessage(error)}`);
    },
  });
}

export function useSubscribeToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingApi.subscribeToPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Subscription created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to subscribe to plan: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdatePricingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: pricingApi.UpdatePricingPlanPayload;
    }) => pricingApi.updatePricingPlan(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      notify.success("Pricing plan updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update pricing plan: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      payload,
    }: {
      subscriptionId: string;
      payload: pricingApi.UpdateSubscriptionPayload;
    }) => pricingApi.updateSubscription(subscriptionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Subscription updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update subscription: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeletePricingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingApi.deletePricingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      notify.success("Pricing plan deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete pricing plan: ${getErrorMessage(error)}`);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pricingApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      notify.success("Subscription cancelled successfully");
    },
    onError: (error) => {
      notify.error(`Failed to cancel subscription: ${getErrorMessage(error)}`);
    },
  });
}

// Classifier Mutations
export function useCreateClassifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifiersApi.createClassifier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success("Classifier created successfully");
    },
    onError: (error) => {
      notify.error(`Failed to create classifier: ${getErrorMessage(error)}`);
    },
  });
}

export function useBulkCreateClassifiers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifiersApi.bulkCreateClassifiers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success(`${data.created} classifiers created successfully`);
    },
    onError: (error) => {
      notify.error(`Failed to create classifiers: ${getErrorMessage(error)}`);
    },
  });
}

export function useUpdateClassifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classifierId,
      payload,
    }: {
      classifierId: string;
      payload: classifiersApi.UpdateClassifierPayload;
    }) => classifiersApi.updateClassifier(classifierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success("Classifier updated successfully");
    },
    onError: (error) => {
      notify.error(`Failed to update classifier: ${getErrorMessage(error)}`);
    },
  });
}

export function useBulkUpdateClassifiers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifiersApi.bulkUpdateClassifiers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success(`${data.updated} classifiers updated successfully`);
    },
    onError: (error) => {
      notify.error(`Failed to update classifiers: ${getErrorMessage(error)}`);
    },
  });
}

export function useDeleteClassifier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifiersApi.deleteClassifier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success("Classifier deleted successfully");
    },
    onError: (error) => {
      notify.error(`Failed to delete classifier: ${getErrorMessage(error)}`);
    },
  });
}

export function useBulkDeleteClassifiers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classifiersApi.bulkDeleteClassifiers,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["classifiers"] });
      notify.success(`${data.deleted} classifiers deleted successfully`);
    },
    onError: (error) => {
      notify.error(`Failed to delete classifiers: ${getErrorMessage(error)}`);
    },
  });
}

/**
 * Comprehensive Test API Examples
 *
 * This file demonstrates how to use all the POST, UPDATE, and DELETE APIs
 * across all modules with proper error handling and user feedback.
 */

import {
  useBulkCreateClassifiers,
  useBulkDeleteClassifiers,
  useBulkUpdateClassifiers,
  useCancelSubscription,
  useCancelTransaction,
  useChangePassword,
  // Classifier mutations
  useCreateClassifier,
  // Device mutations
  useCreateDevice,
  // Invoice mutations
  useCreateInvoice,
  // Billing mutations
  useCreatePaymentMethod,
  // Pricing mutations
  useCreatePricingPlan,
  // Settlement mutations
  useCreateSettlement,
  useCreateStore,
  // Transaction mutations
  useCreateTransaction,
  // Auth mutations
  useCreateUser,
  useMakePayment,
  useMarkInvoicePaid,
  usePairDevice,
  useRefundTransaction,
  useRequestSettlement,
  useRestartDevice,
  useRetrySettlement,
  useSendInvoice,
  useSubscribeToPlan,
  useUpdateBillingSettings,
  useUpdateCompany,
  useUpdateProfile,
} from "@/services/hooks/mutations";

// Example usage in a React component
export function TestApiExamples() {
  // Auth API Examples
  const createUserMutation = useCreateUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  // Company API Examples
  const updateCompanyMutation = useUpdateCompany();
  const createStoreMutation = useCreateStore();

  // Device API Examples
  const createDeviceMutation = useCreateDevice();
  const pairDeviceMutation = usePairDevice();
  const restartDeviceMutation = useRestartDevice();

  // Transaction API Examples
  const createTransactionMutation = useCreateTransaction();
  const refundTransactionMutation = useRefundTransaction();
  const cancelTransactionMutation = useCancelTransaction();

  // Billing API Examples
  const createPaymentMethodMutation = useCreatePaymentMethod();
  const makePaymentMutation = useMakePayment();
  const updateBillingSettingsMutation = useUpdateBillingSettings();

  // Settlement API Examples
  const createSettlementMutation = useCreateSettlement();
  const requestSettlementMutation = useRequestSettlement();
  const retrySettlementMutation = useRetrySettlement();

  // Invoice API Examples
  const createInvoiceMutation = useCreateInvoice();
  const sendInvoiceMutation = useSendInvoice();
  const markInvoicePaidMutation = useMarkInvoicePaid();

  // Pricing API Examples
  const createPricingPlanMutation = useCreatePricingPlan();
  const subscribeToPlanMutation = useSubscribeToPlan();
  const cancelSubscriptionMutation = useCancelSubscription();

  // Classifier API Examples
  const createClassifierMutation = useCreateClassifier();
  const bulkCreateClassifiersMutation = useBulkCreateClassifiers();
  const bulkUpdateClassifiersMutation = useBulkUpdateClassifiers();
  const bulkDeleteClassifiersMutation = useBulkDeleteClassifiers();

  // Example functions demonstrating API usage
  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        email: "test@example.com",
        password: "securePassword123",
        role: "user",
        firstName: "John",
        lastName: "Doe",
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      await updateCompanyMutation.mutateAsync({
        name: "Updated Company Name",
        email: "updated@company.com",
        address: "123 New Street, City, Country",
        phone: "+1234567890",
        website: "https://updated-company.com",
        taxId: "TAX123456789",
      });
    } catch (error) {
      console.error("Failed to update company:", error);
    }
  };

  const handleCreateDevice = async () => {
    try {
      await createDeviceMutation.mutateAsync({
        name: "POS Terminal 1",
        type: "pos",
        location: "Main Store Floor",
        storeId: "store-123",
      });
    } catch (error) {
      console.error("Failed to create device:", error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      await createTransactionMutation.mutateAsync({
        amount: 29.99,
        currency: "USD",
        customerId: "customer-123",
        storeId: "store-123",
        deviceId: "device-123",
        description: "Coffee and pastry",
      });
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const handleRefundTransaction = async () => {
    try {
      await refundTransactionMutation.mutateAsync({
        transactionId: "transaction-123",
        amount: 15.0, // Partial refund
        reason: "Customer requested refund",
      });
    } catch (error) {
      console.error("Failed to refund transaction:", error);
    }
  };

  const handleCreatePaymentMethod = async () => {
    try {
      await createPaymentMethodMutation.mutateAsync({
        type: "card",
        cardNumber: "4111111111111111",
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: "123",
      });
    } catch (error) {
      console.error("Failed to create payment method:", error);
    }
  };

  const handleMakePayment = async () => {
    try {
      await makePaymentMutation.mutateAsync({
        amount: 100.0,
        currency: "USD",
        paymentMethodId: "payment-method-123",
        description: "Monthly subscription payment",
      });
    } catch (error) {
      console.error("Failed to make payment:", error);
    }
  };

  const handleCreateSettlement = async () => {
    try {
      await createSettlementMutation.mutateAsync({
        amount: 5000.0,
        currency: "USD",
        period: "2025-01-01",
        bankAccountId: "bank-account-123",
        description: "Monthly settlement",
      });
    } catch (error) {
      console.error("Failed to create settlement:", error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await createInvoiceMutation.mutateAsync({
        amount: 150.0,
        currency: "USD",
        dueAt: "2025-02-01",
        description: "Monthly service fee",
        customerId: "customer-123",
        items: [
          {
            description: "Service Fee",
            amount: 100.0,
            quantity: 1,
          },
          {
            description: "Processing Fee",
            amount: 50.0,
            quantity: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

  const handleSendInvoice = async () => {
    try {
      await sendInvoiceMutation.mutateAsync({
        invoiceId: "invoice-123",
        email: "customer@example.com",
        message: "Please find your invoice attached.",
      });
    } catch (error) {
      console.error("Failed to send invoice:", error);
    }
  };

  const handleCreatePricingPlan = async () => {
    try {
      await createPricingPlanMutation.mutateAsync({
        name: "Premium Plan",
        ratePercent: 2.5,
        monthlyFee: 99.99,
        currency: "USD",
        description: "Premium features with lower rates",
        features: [
          "Advanced analytics",
          "Priority support",
          "Custom integrations",
          "24/7 monitoring",
        ],
      });
    } catch (error) {
      console.error("Failed to create pricing plan:", error);
    }
  };

  const handleSubscribeToPlan = async () => {
    try {
      await subscribeToPlanMutation.mutateAsync({
        planId: "plan-123",
        paymentMethodId: "payment-method-123",
      });
    } catch (error) {
      console.error("Failed to subscribe to plan:", error);
    }
  };

  const handleCreateClassifier = async () => {
    try {
      await createClassifierMutation.mutateAsync({
        key: "food_category",
        label: "Food Category",
        description: "Classifies food items",
        category: "product",
      });
    } catch (error) {
      console.error("Failed to create classifier:", error);
    }
  };

  const handleBulkCreateClassifiers = async () => {
    try {
      await bulkCreateClassifiersMutation.mutateAsync({
        classifiers: [
          {
            key: "beverage_type",
            label: "Beverage Type",
            description: "Classifies beverages",
            category: "product",
          },
          {
            key: "payment_method",
            label: "Payment Method",
            description: "Classifies payment methods",
            category: "transaction",
          },
          {
            key: "customer_segment",
            label: "Customer Segment",
            description: "Classifies customer segments",
            category: "customer",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to bulk create classifiers:", error);
    }
  };

  const handleBulkUpdateClassifiers = async () => {
    try {
      await bulkUpdateClassifiersMutation.mutateAsync({
        classifiers: [
          {
            id: "classifier-1",
            label: "Updated Food Category",
            description: "Updated description",
          },
          {
            id: "classifier-2",
            label: "Updated Beverage Type",
            category: "updated_category",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to bulk update classifiers:", error);
    }
  };

  const handleBulkDeleteClassifiers = async () => {
    try {
      await bulkDeleteClassifiersMutation.mutateAsync({
        classifierIds: ["classifier-1", "classifier-2", "classifier-3"],
      });
    } catch (error) {
      console.error("Failed to bulk delete classifiers:", error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test API Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Auth Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Auth APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateUser}
              disabled={createUserMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </button>
            <button
              onClick={() =>
                updateProfileMutation.mutateAsync({
                  firstName: "Updated",
                  lastName: "Name",
                  email: "updated@example.com",
                })
              }
              disabled={updateProfileMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {updateProfileMutation.isPending
                ? "Updating..."
                : "Update Profile"}
            </button>
            <button
              onClick={() =>
                changePasswordMutation.mutateAsync({
                  currentPassword: "oldPassword",
                  newPassword: "newSecurePassword123",
                })
              }
              disabled={changePasswordMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {changePasswordMutation.isPending
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </div>

        {/* Company Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Company APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleUpdateCompany}
              disabled={updateCompanyMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {updateCompanyMutation.isPending
                ? "Updating..."
                : "Update Company"}
            </button>
            <button
              onClick={() =>
                createStoreMutation.mutateAsync({
                  name: "New Store",
                  address: "123 Store Street",
                  phone: "+1234567890",
                  email: "store@example.com",
                  category: "retail",
                })
              }
              disabled={createStoreMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {createStoreMutation.isPending ? "Creating..." : "Create Store"}
            </button>
          </div>
        </div>

        {/* Device Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Device APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateDevice}
              disabled={createDeviceMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createDeviceMutation.isPending ? "Creating..." : "Create Device"}
            </button>
            <button
              onClick={() =>
                pairDeviceMutation.mutateAsync({
                  deviceId: "device-123",
                  pairingCode: "123456",
                })
              }
              disabled={pairDeviceMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {pairDeviceMutation.isPending ? "Pairing..." : "Pair Device"}
            </button>
            <button
              onClick={() => restartDeviceMutation.mutateAsync("device-123")}
              disabled={restartDeviceMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {restartDeviceMutation.isPending
                ? "Restarting..."
                : "Restart Device"}
            </button>
          </div>
        </div>

        {/* Transaction Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Transaction APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateTransaction}
              disabled={createTransactionMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createTransactionMutation.isPending
                ? "Creating..."
                : "Create Transaction"}
            </button>
            <button
              onClick={handleRefundTransaction}
              disabled={refundTransactionMutation.isPending}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {refundTransactionMutation.isPending
                ? "Refunding..."
                : "Refund Transaction"}
            </button>
            <button
              onClick={() =>
                cancelTransactionMutation.mutateAsync("transaction-123")
              }
              disabled={cancelTransactionMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {cancelTransactionMutation.isPending
                ? "Cancelling..."
                : "Cancel Transaction"}
            </button>
          </div>
        </div>

        {/* Billing Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Billing APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreatePaymentMethod}
              disabled={createPaymentMethodMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createPaymentMethodMutation.isPending
                ? "Creating..."
                : "Add Payment Method"}
            </button>
            <button
              onClick={handleMakePayment}
              disabled={makePaymentMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {makePaymentMutation.isPending ? "Processing..." : "Make Payment"}
            </button>
            <button
              onClick={() =>
                updateBillingSettingsMutation.mutateAsync({
                  autoPay: true,
                  billingEmail: "billing@company.com",
                  currency: "USD",
                })
              }
              disabled={updateBillingSettingsMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {updateBillingSettingsMutation.isPending
                ? "Updating..."
                : "Update Billing Settings"}
            </button>
          </div>
        </div>

        {/* Settlement Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Settlement APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateSettlement}
              disabled={createSettlementMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createSettlementMutation.isPending
                ? "Creating..."
                : "Create Settlement"}
            </button>
            <button
              onClick={() =>
                requestSettlementMutation.mutateAsync({
                  amount: 2500.0,
                  currency: "USD",
                  bankAccountId: "bank-account-123",
                })
              }
              disabled={requestSettlementMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {requestSettlementMutation.isPending
                ? "Requesting..."
                : "Request Settlement"}
            </button>
            <button
              onClick={() =>
                retrySettlementMutation.mutateAsync("settlement-123")
              }
              disabled={retrySettlementMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {retrySettlementMutation.isPending
                ? "Retrying..."
                : "Retry Settlement"}
            </button>
          </div>
        </div>

        {/* Invoice Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Invoice APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateInvoice}
              disabled={createInvoiceMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createInvoiceMutation.isPending
                ? "Creating..."
                : "Create Invoice"}
            </button>
            <button
              onClick={handleSendInvoice}
              disabled={sendInvoiceMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {sendInvoiceMutation.isPending ? "Sending..." : "Send Invoice"}
            </button>
            <button
              onClick={() => markInvoicePaidMutation.mutateAsync("invoice-123")}
              disabled={markInvoicePaidMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {markInvoicePaidMutation.isPending
                ? "Marking..."
                : "Mark Invoice Paid"}
            </button>
          </div>
        </div>

        {/* Pricing Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Pricing APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreatePricingPlan}
              disabled={createPricingPlanMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createPricingPlanMutation.isPending
                ? "Creating..."
                : "Create Pricing Plan"}
            </button>
            <button
              onClick={handleSubscribeToPlan}
              disabled={subscribeToPlanMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {subscribeToPlanMutation.isPending
                ? "Subscribing..."
                : "Subscribe to Plan"}
            </button>
            <button
              onClick={() =>
                cancelSubscriptionMutation.mutateAsync("subscription-123")
              }
              disabled={cancelSubscriptionMutation.isPending}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {cancelSubscriptionMutation.isPending
                ? "Cancelling..."
                : "Cancel Subscription"}
            </button>
          </div>
        </div>

        {/* Classifier Examples */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Classifier APIs</h2>
          <div className="space-y-2">
            <button
              onClick={handleCreateClassifier}
              disabled={createClassifierMutation.isPending}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {createClassifierMutation.isPending
                ? "Creating..."
                : "Create Classifier"}
            </button>
            <button
              onClick={handleBulkCreateClassifiers}
              disabled={bulkCreateClassifiersMutation.isPending}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {bulkCreateClassifiersMutation.isPending
                ? "Creating..."
                : "Bulk Create Classifiers"}
            </button>
            <button
              onClick={handleBulkUpdateClassifiers}
              disabled={bulkUpdateClassifiersMutation.isPending}
              className="w-full px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {bulkUpdateClassifiersMutation.isPending
                ? "Updating..."
                : "Bulk Update Classifiers"}
            </button>
            <button
              onClick={handleBulkDeleteClassifiers}
              disabled={bulkDeleteClassifiersMutation.isPending}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {bulkDeleteClassifiersMutation.isPending
                ? "Deleting..."
                : "Bulk Delete Classifiers"}
            </button>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Mutation Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div
            className={`p-2 rounded ${
              createUserMutation.isPending
                ? "bg-yellow-200"
                : createUserMutation.isSuccess
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          >
            Create User:{" "}
            {createUserMutation.isPending
              ? "Pending"
              : createUserMutation.isSuccess
              ? "Success"
              : "Idle"}
          </div>
          <div
            className={`p-2 rounded ${
              updateCompanyMutation.isPending
                ? "bg-yellow-200"
                : updateCompanyMutation.isSuccess
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          >
            Update Company:{" "}
            {updateCompanyMutation.isPending
              ? "Pending"
              : updateCompanyMutation.isSuccess
              ? "Success"
              : "Idle"}
          </div>
          <div
            className={`p-2 rounded ${
              createDeviceMutation.isPending
                ? "bg-yellow-200"
                : createDeviceMutation.isSuccess
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          >
            Create Device:{" "}
            {createDeviceMutation.isPending
              ? "Pending"
              : createDeviceMutation.isSuccess
              ? "Success"
              : "Idle"}
          </div>
          <div
            className={`p-2 rounded ${
              createTransactionMutation.isPending
                ? "bg-yellow-200"
                : createTransactionMutation.isSuccess
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          >
            Create Transaction:{" "}
            {createTransactionMutation.isPending
              ? "Pending"
              : createTransactionMutation.isSuccess
              ? "Success"
              : "Idle"}
          </div>
        </div>
      </div>
    </div>
  );
}

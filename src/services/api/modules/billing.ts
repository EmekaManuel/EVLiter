import api from "@/services/apiClient";

export type BillingSummary = {
  currentBalance: number;
  nextInvoiceDate: string;
  currency: string;
};

export async function getBillingSummary() {
  const { data } = await api.get<BillingSummary>("/billing/summary");
  return data;
}

// POST APIs
export type CreatePaymentMethodPayload = {
  type: "card" | "bank_account";
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  bankAccountNumber?: string;
  routingNumber?: string;
};

export type CreatePaymentMethodResponse = {
  id: string;
  type: "card" | "bank_account";
  last4: string;
  brand?: string;
  isDefault: boolean;
  createdAt: string;
};

export async function createPaymentMethod(payload: CreatePaymentMethodPayload) {
  const { data } = await api.post<CreatePaymentMethodResponse>(
    "/billing/payment-methods",
    payload
  );
  return data;
}

export type MakePaymentPayload = {
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
};

export type MakePaymentResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  paymentMethodId: string;
  description?: string;
  createdAt: string;
};

export async function makePayment(payload: MakePaymentPayload) {
  const { data } = await api.post<MakePaymentResponse>(
    "/billing/payments",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdatePaymentMethodPayload = {
  isDefault?: boolean;
};

export type UpdatePaymentMethodResponse = {
  id: string;
  type: "card" | "bank_account";
  last4: string;
  brand?: string;
  isDefault: boolean;
  updatedAt: string;
};

export async function updatePaymentMethod(
  paymentMethodId: string,
  payload: UpdatePaymentMethodPayload
) {
  const { data } = await api.put<UpdatePaymentMethodResponse>(
    `/billing/payment-methods/${paymentMethodId}`,
    payload
  );
  return data;
}

export type UpdateBillingSettingsPayload = {
  autoPay?: boolean;
  billingEmail?: string;
  currency?: string;
};

export type UpdateBillingSettingsResponse = {
  autoPay: boolean;
  billingEmail: string;
  currency: string;
  updatedAt: string;
};

export async function updateBillingSettings(
  payload: UpdateBillingSettingsPayload
) {
  const { data } = await api.put<UpdateBillingSettingsResponse>(
    "/billing/settings",
    payload
  );
  return data;
}

// DELETE APIs
export type DeletePaymentMethodResponse = {
  message: string;
};

export async function deletePaymentMethod(paymentMethodId: string) {
  const { data } = await api.delete<DeletePaymentMethodResponse>(
    `/billing/payment-methods/${paymentMethodId}`
  );
  return data;
}

export type CancelSubscriptionResponse = {
  message: string;
  cancelledAt: string;
};

export async function cancelSubscription() {
  const { data } = await api.delete<CancelSubscriptionResponse>(
    "/billing/subscription"
  );
  return data;
}

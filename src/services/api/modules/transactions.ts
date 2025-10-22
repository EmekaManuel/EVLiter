/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/services/apiClient";

export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  createdAt: string;
};

export type ListTransactionsParams = {
  page?: number;
  pageSize?: number;
  status?: Transaction["status"];
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listTransactions(params: ListTransactionsParams = {}) {
  const { data } = await api.get<Paginated<Transaction>>("/transactions", {
    params,
  });
  return data;
}

// POST APIs
export type CreateTransactionPayload = {
  amount: number;
  currency: string;
  customerId?: string;
  storeId: string;
  deviceId?: string;
  description?: string;
};

export type CreateTransactionResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  customerId?: string;
  storeId: string;
  deviceId?: string;
  description?: string;
  createdAt: string;
};

export async function createTransaction(payload: CreateTransactionPayload) {
  const { data } = await api.post<CreateTransactionResponse>(
    "/transactions",
    payload
  );
  return data;
}

export type RefundTransactionPayload = {
  transactionId: string;
  amount?: number; // Partial refund if specified, full refund if not
  reason: string;
};

export type RefundTransactionResponse = {
  id: string;
  originalTransactionId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  reason: string;
  createdAt: string;
};

export async function refundTransaction(payload: RefundTransactionPayload) {
  const { data } = await api.post<RefundTransactionResponse>(
    "/transactions/refund",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateTransactionPayload = {
  description?: string;
  metadata?: Record<string, any>;
};

export type UpdateTransactionResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  description?: string;
  metadata?: Record<string, any>;
  updatedAt: string;
};

export async function updateTransaction(
  transactionId: string,
  payload: UpdateTransactionPayload
) {
  const { data } = await api.put<UpdateTransactionResponse>(
    `/transactions/${transactionId}`,
    payload
  );
  return data;
}

export type CancelTransactionResponse = {
  id: string;
  status: "cancelled";
  cancelledAt: string;
};

export async function cancelTransaction(transactionId: string) {
  const { data } = await api.put<CancelTransactionResponse>(
    `/transactions/${transactionId}/cancel`
  );
  return data;
}

// DELETE APIs
export type DeleteTransactionResponse = {
  message: string;
};

export async function deleteTransaction(transactionId: string) {
  const { data } = await api.delete<DeleteTransactionResponse>(
    `/transactions/${transactionId}`
  );
  return data;
}

export type VoidTransactionResponse = {
  id: string;
  status: "voided";
  voidedAt: string;
};

export async function voidTransaction(transactionId: string) {
  const { data } = await api.delete<VoidTransactionResponse>(
    `/transactions/${transactionId}/void`
  );
  return data;
}

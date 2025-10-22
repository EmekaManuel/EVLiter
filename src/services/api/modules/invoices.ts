import api from "@/services/apiClient";

export type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue";
  issuedAt: string;
  dueAt: string;
};

export type ListInvoicesParams = {
  page?: number;
  pageSize?: number;
  status?: Invoice["status"];
};
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listInvoices(params: ListInvoicesParams = {}) {
  const { data } = await api.get<Paginated<Invoice>>("/invoices", { params });
  return data;
}

// POST APIs
export type CreateInvoicePayload = {
  amount: number;
  currency: string;
  dueAt: string;
  description?: string;
  customerId?: string;
  items: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
};

export type CreateInvoiceResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue";
  issuedAt: string;
  dueAt: string;
  description?: string;
  customerId?: string;
  createdAt: string;
};

export async function createInvoice(payload: CreateInvoicePayload) {
  const { data } = await api.post<CreateInvoiceResponse>("/invoices", payload);
  return data;
}

export type SendInvoicePayload = {
  invoiceId: string;
  email: string;
  message?: string;
};

export type SendInvoiceResponse = {
  message: string;
  sentAt: string;
};

export async function sendInvoice(payload: SendInvoicePayload) {
  const { data } = await api.post<SendInvoiceResponse>(
    "/invoices/send",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateInvoicePayload = {
  description?: string;
  dueAt?: string;
  items?: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
};

export type UpdateInvoiceResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "unpaid" | "overdue";
  description?: string;
  dueAt: string;
  updatedAt: string;
};

export async function updateInvoice(
  invoiceId: string,
  payload: UpdateInvoicePayload
) {
  const { data } = await api.put<UpdateInvoiceResponse>(
    `/invoices/${invoiceId}`,
    payload
  );
  return data;
}

export type MarkInvoicePaidResponse = {
  id: string;
  status: "paid";
  paidAt: string;
};

export async function markInvoicePaid(invoiceId: string) {
  const { data } = await api.put<MarkInvoicePaidResponse>(
    `/invoices/${invoiceId}/mark-paid`
  );
  return data;
}

// DELETE APIs
export type DeleteInvoiceResponse = {
  message: string;
};

export async function deleteInvoice(invoiceId: string) {
  const { data } = await api.delete<DeleteInvoiceResponse>(
    `/invoices/${invoiceId}`
  );
  return data;
}

export type VoidInvoiceResponse = {
  id: string;
  status: "voided";
  voidedAt: string;
};

export async function voidInvoice(invoiceId: string) {
  const { data } = await api.delete<VoidInvoiceResponse>(
    `/invoices/${invoiceId}/void`
  );
  return data;
}

import api from "@/services/apiClient";

export type Settlement = {
  id: string;
  amount: number;
  currency: string;
  period: string; // e.g., 2025-10-01
  status: "processing" | "completed" | "failed";
};

export type ListSettlementsParams = {
  page?: number;
  pageSize?: number;
  status?: Settlement["status"];
};
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listSettlements(params: ListSettlementsParams = {}) {
  const { data } = await api.get<Paginated<Settlement>>("/settlements", {
    params,
  });
  return data;
}

// POST APIs
export type CreateSettlementPayload = {
  amount: number;
  currency: string;
  period: string;
  bankAccountId: string;
  description?: string;
};

export type CreateSettlementResponse = {
  id: string;
  amount: number;
  currency: string;
  period: string;
  status: "processing" | "completed" | "failed";
  bankAccountId: string;
  description?: string;
  createdAt: string;
};

export async function createSettlement(payload: CreateSettlementPayload) {
  const { data } = await api.post<CreateSettlementResponse>(
    "/settlements",
    payload
  );
  return data;
}

export type RequestSettlementPayload = {
  amount: number;
  currency: string;
  bankAccountId: string;
};

export type RequestSettlementResponse = {
  id: string;
  amount: number;
  currency: string;
  status: "processing" | "completed" | "failed";
  bankAccountId: string;
  requestedAt: string;
};

export async function requestSettlement(payload: RequestSettlementPayload) {
  const { data } = await api.post<RequestSettlementResponse>(
    "/settlements/request",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateSettlementPayload = {
  description?: string;
  bankAccountId?: string;
};

export type UpdateSettlementResponse = {
  id: string;
  amount: number;
  currency: string;
  period: string;
  status: "processing" | "completed" | "failed";
  description?: string;
  bankAccountId: string;
  updatedAt: string;
};

export async function updateSettlement(
  settlementId: string,
  payload: UpdateSettlementPayload
) {
  const { data } = await api.put<UpdateSettlementResponse>(
    `/settlements/${settlementId}`,
    payload
  );
  return data;
}

export type RetrySettlementResponse = {
  id: string;
  status: "processing";
  retriedAt: string;
};

export async function retrySettlement(settlementId: string) {
  const { data } = await api.put<RetrySettlementResponse>(
    `/settlements/${settlementId}/retry`
  );
  return data;
}

// DELETE APIs
export type DeleteSettlementResponse = {
  message: string;
};

export async function deleteSettlement(settlementId: string) {
  const { data } = await api.delete<DeleteSettlementResponse>(
    `/settlements/${settlementId}`
  );
  return data;
}

export type CancelSettlementResponse = {
  id: string;
  status: "cancelled";
  cancelledAt: string;
};

export async function cancelSettlement(settlementId: string) {
  const { data } = await api.delete<CancelSettlementResponse>(
    `/settlements/${settlementId}/cancel`
  );
  return data;
}

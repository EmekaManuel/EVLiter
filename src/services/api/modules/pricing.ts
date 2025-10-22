import api from "@/services/apiClient";

export type PricingPlan = {
  id: string;
  name: string;
  ratePercent: number;
  monthlyFee: number;
  currency: string;
};

export async function listPricingPlans() {
  const { data } = await api.get<PricingPlan[]>("/pricing/plans");
  return data;
}

// POST APIs
export type CreatePricingPlanPayload = {
  name: string;
  ratePercent: number;
  monthlyFee: number;
  currency: string;
  description?: string;
  features: string[];
};

export type CreatePricingPlanResponse = {
  id: string;
  name: string;
  ratePercent: number;
  monthlyFee: number;
  currency: string;
  description?: string;
  features: string[];
  createdAt: string;
};

export async function createPricingPlan(payload: CreatePricingPlanPayload) {
  const { data } = await api.post<CreatePricingPlanResponse>(
    "/pricing/plans",
    payload
  );
  return data;
}

export type SubscribeToPlanPayload = {
  planId: string;
  paymentMethodId: string;
};

export type SubscribeToPlanResponse = {
  subscriptionId: string;
  planId: string;
  status: "active" | "pending" | "failed";
  startDate: string;
  endDate: string;
};

export async function subscribeToPlan(payload: SubscribeToPlanPayload) {
  const { data } = await api.post<SubscribeToPlanResponse>(
    "/pricing/subscribe",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdatePricingPlanPayload = {
  name?: string;
  ratePercent?: number;
  monthlyFee?: number;
  description?: string;
  features?: string[];
};

export type UpdatePricingPlanResponse = {
  id: string;
  name: string;
  ratePercent: number;
  monthlyFee: number;
  currency: string;
  description?: string;
  features: string[];
  updatedAt: string;
};

export async function updatePricingPlan(
  planId: string,
  payload: UpdatePricingPlanPayload
) {
  const { data } = await api.put<UpdatePricingPlanResponse>(
    `/pricing/plans/${planId}`,
    payload
  );
  return data;
}

export type UpdateSubscriptionPayload = {
  planId?: string;
  paymentMethodId?: string;
};

export type UpdateSubscriptionResponse = {
  subscriptionId: string;
  planId: string;
  status: "active" | "pending" | "failed";
  updatedAt: string;
};

export async function updateSubscription(
  subscriptionId: string,
  payload: UpdateSubscriptionPayload
) {
  const { data } = await api.put<UpdateSubscriptionResponse>(
    `/pricing/subscriptions/${subscriptionId}`,
    payload
  );
  return data;
}

// DELETE APIs
export type DeletePricingPlanResponse = {
  message: string;
};

export async function deletePricingPlan(planId: string) {
  const { data } = await api.delete<DeletePricingPlanResponse>(
    `/pricing/plans/${planId}`
  );
  return data;
}

export type CancelSubscriptionResponse = {
  subscriptionId: string;
  status: "cancelled";
  cancelledAt: string;
};

export async function cancelSubscription(subscriptionId: string) {
  const { data } = await api.delete<CancelSubscriptionResponse>(
    `/pricing/subscriptions/${subscriptionId}`
  );
  return data;
}

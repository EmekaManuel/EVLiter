import api from "@/services/apiClient";

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  createdAt: string;
};

export type ListActivityParams = { page?: number; pageSize?: number };
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listActivity(params: ListActivityParams = {}) {
  const { data } = await api.get<Paginated<ActivityItem>>("/activity", {
    params,
  });
  return data;
}

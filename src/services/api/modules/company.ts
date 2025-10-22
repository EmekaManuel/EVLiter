import api from "@/services/apiClient";

export type CompanyProfile = {
  id: string;
  name: string;
  email: string;
  address?: string;
};

export async function getCompanyProfile() {
  const { data } = await api.get<CompanyProfile>("/company/profile");
  return data;
}

// POST APIs
export type CreateCompanyPayload = {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  website?: string;
  taxId?: string;
};

export type CreateCompanyResponse = {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  createdAt: string;
};

export async function createCompany(payload: CreateCompanyPayload) {
  const { data } = await api.post<CreateCompanyResponse>("/company", payload);
  return data;
}

export type CreateStorePayload = {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  category: string;
};

export type CreateStoreResponse = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
};

export async function createStore(payload: CreateStorePayload) {
  const { data } = await api.post<CreateStoreResponse>(
    "/company/stores",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateCompanyPayload = {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  website?: string;
  taxId?: string;
};

export type UpdateCompanyResponse = {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  updatedAt: string;
};

export async function updateCompany(payload: UpdateCompanyPayload) {
  const { data } = await api.put<UpdateCompanyResponse>(
    "/company/profile",
    payload
  );
  return data;
}

export type UpdateStorePayload = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  category?: string;
  status?: "active" | "inactive";
};

export type UpdateStoreResponse = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  category: string;
  status: "active" | "inactive";
  updatedAt: string;
};

export async function updateStore(
  storeId: string,
  payload: UpdateStorePayload
) {
  const { data } = await api.put<UpdateStoreResponse>(
    `/company/stores/${storeId}`,
    payload
  );
  return data;
}

// DELETE APIs
export type DeleteStoreResponse = {
  message: string;
};

export async function deleteStore(storeId: string) {
  const { data } = await api.delete<DeleteStoreResponse>(
    `/company/stores/${storeId}`
  );
  return data;
}

export type ArchiveCompanyResponse = {
  message: string;
};

export async function archiveCompany() {
  const { data } = await api.delete<ArchiveCompanyResponse>("/company");
  return data;
}

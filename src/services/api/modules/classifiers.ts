import api from "@/services/apiClient";

export type Classifier = {
  id: string;
  key: string;
  label: string;
};

export async function listClassifiers() {
  const { data } = await api.get<Classifier[]>("/classifiers");
  return data;
}

// POST APIs
export type CreateClassifierPayload = {
  key: string;
  label: string;
  description?: string;
  category?: string;
};

export type CreateClassifierResponse = {
  id: string;
  key: string;
  label: string;
  description?: string;
  category?: string;
  createdAt: string;
};

export async function createClassifier(payload: CreateClassifierPayload) {
  const { data } = await api.post<CreateClassifierResponse>(
    "/classifiers",
    payload
  );
  return data;
}

export type BulkCreateClassifiersPayload = {
  classifiers: Array<{
    key: string;
    label: string;
    description?: string;
    category?: string;
  }>;
};

export type BulkCreateClassifiersResponse = {
  created: number;
  classifiers: CreateClassifierResponse[];
};

export async function bulkCreateClassifiers(
  payload: BulkCreateClassifiersPayload
) {
  const { data } = await api.post<BulkCreateClassifiersResponse>(
    "/classifiers/bulk",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateClassifierPayload = {
  key?: string;
  label?: string;
  description?: string;
  category?: string;
};

export type UpdateClassifierResponse = {
  id: string;
  key: string;
  label: string;
  description?: string;
  category?: string;
  updatedAt: string;
};

export async function updateClassifier(
  classifierId: string,
  payload: UpdateClassifierPayload
) {
  const { data } = await api.put<UpdateClassifierResponse>(
    `/classifiers/${classifierId}`,
    payload
  );
  return data;
}

export type BulkUpdateClassifiersPayload = {
  classifiers: Array<{
    id: string;
    key?: string;
    label?: string;
    description?: string;
    category?: string;
  }>;
};

export type BulkUpdateClassifiersResponse = {
  updated: number;
  classifiers: UpdateClassifierResponse[];
};

export async function bulkUpdateClassifiers(
  payload: BulkUpdateClassifiersPayload
) {
  const { data } = await api.put<BulkUpdateClassifiersResponse>(
    "/classifiers/bulk",
    payload
  );
  return data;
}

// DELETE APIs
export type DeleteClassifierResponse = {
  message: string;
};

export async function deleteClassifier(classifierId: string) {
  const { data } = await api.delete<DeleteClassifierResponse>(
    `/classifiers/${classifierId}`
  );
  return data;
}

export type BulkDeleteClassifiersPayload = {
  classifierIds: string[];
};

export type BulkDeleteClassifiersResponse = {
  deleted: number;
  message: string;
};

export async function bulkDeleteClassifiers(
  payload: BulkDeleteClassifiersPayload
) {
  const { data } = await api.delete<BulkDeleteClassifiersResponse>(
    "/classifiers/bulk",
    { data: payload }
  );
  return data;
}

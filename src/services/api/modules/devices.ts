import api from "@/services/apiClient";

export type Device = {
  id: string;
  name: string;
  status: "online" | "offline" | "error";
  lastSeenAt: string;
};

export type ListDevicesParams = {
  page?: number;
  pageSize?: number;
  status?: Device["status"];
};
export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listDevices(params: ListDevicesParams = {}) {
  const { data } = await api.get<Paginated<Device>>("/devices", { params });
  return data;
}

// POST APIs
export type CreateDevicePayload = {
  name: string;
  type: "pos" | "terminal" | "gateway";
  location: string;
  storeId?: string;
};

export type CreateDeviceResponse = {
  id: string;
  name: string;
  type: "pos" | "terminal" | "gateway";
  location: string;
  storeId?: string;
  status: "online" | "offline" | "error";
  createdAt: string;
};

export async function createDevice(payload: CreateDevicePayload) {
  const { data } = await api.post<CreateDeviceResponse>("/devices", payload);
  return data;
}

export type PairDevicePayload = {
  deviceId: string;
  pairingCode: string;
};

export type PairDeviceResponse = {
  message: string;
  deviceId: string;
  pairedAt: string;
};

export async function pairDevice(payload: PairDevicePayload) {
  const { data } = await api.post<PairDeviceResponse>("/devices/pair", payload);
  return data;
}

// UPDATE APIs
export type UpdateDevicePayload = {
  name?: string;
  location?: string;
  storeId?: string;
};

export type UpdateDeviceResponse = {
  id: string;
  name: string;
  type: "pos" | "terminal" | "gateway";
  location: string;
  storeId?: string;
  status: "online" | "offline" | "error";
  updatedAt: string;
};

export async function updateDevice(
  deviceId: string,
  payload: UpdateDevicePayload
) {
  const { data } = await api.put<UpdateDeviceResponse>(
    `/devices/${deviceId}`,
    payload
  );
  return data;
}

export type RestartDeviceResponse = {
  message: string;
  deviceId: string;
  restartedAt: string;
};

export async function restartDevice(deviceId: string) {
  const { data } = await api.put<RestartDeviceResponse>(
    `/devices/${deviceId}/restart`
  );
  return data;
}

// DELETE APIs
export type DeleteDeviceResponse = {
  message: string;
};

export async function deleteDevice(deviceId: string) {
  const { data } = await api.delete<DeleteDeviceResponse>(
    `/devices/${deviceId}`
  );
  return data;
}

export type UnpairDeviceResponse = {
  message: string;
  deviceId: string;
  unpairedAt: string;
};

export async function unpairDevice(deviceId: string) {
  const { data } = await api.delete<UnpairDeviceResponse>(
    `/devices/${deviceId}/unpair`
  );
  return data;
}

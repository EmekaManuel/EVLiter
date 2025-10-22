import api from "@/services/apiClient";

export async function randomFail() {
  const { data } = await api.get<{ ok: boolean }>("/demo/random-fail");
  return data;
}

export async function echo<T extends Record<string, unknown>>(payload: T) {
  const { data } = await api.post<{ received: T; message: string }>(
    "/demo/echo",
    payload
  );
  return data;
}

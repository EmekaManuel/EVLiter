import api from "@/services/apiClient";

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};
export type LoginPayload = { email: string; password: string };

export type TokenResponse = {
  user: { id: string; email: string; name?: string; role: "user" | "admin" };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<TokenResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<TokenResponse>("/auth/login", payload);
  return data;
}

export type RefreshResponse = { accessToken: string; expiresIn: number };
export async function refresh(refreshToken: string) {
  const { data } = await api.post<RefreshResponse>("/auth/refresh", {
    refreshToken,
  });
  return data;
}

export async function logout() {
  const { data } = await api.post<{ success: boolean }>("/auth/logout", {});
  return data;
}

export type MeResponse = {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatarUrl?: string;
};

export async function me() {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export type UpdateProfilePayload = { name?: string; avatarUrl?: string };
export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.put<MeResponse>("/auth/me", payload);
  return data;
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await api.put<{ success: true }>("/auth/password", payload);
  return data;
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ success: boolean; token?: string }>(
    "/auth/forgot-password",
    { email }
  );
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data } = await api.post<{ success: boolean }>(
    "/auth/reset-password",
    { token, newPassword }
  );
  return data;
}

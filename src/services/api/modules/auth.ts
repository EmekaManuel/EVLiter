import api from "@/services/apiClient";

export type SignInPayload = { email: string; password: string };
export type SignInResponse = { accessToken: string };

export async function signIn(payload: SignInPayload) {
  const { data } = await api.post<SignInResponse>("/auth/sign-in", payload);
  return data;
}

export type MeResponse = { id: string; email: string; role: string };
export async function me() {
  const { data } = await api.get<MeResponse>("/me");
  return data;
}

// POST APIs
export type CreateUserPayload = {
  email: string;
  password: string;
  role: "admin" | "user";
  firstName: string;
  lastName: string;
};

export type CreateUserResponse = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

export async function createUser(payload: CreateUserPayload) {
  const { data } = await api.post<CreateUserResponse>("/auth/users", payload);
  return data;
}

export type ResetPasswordPayload = {
  email: string;
};

export type ResetPasswordResponse = {
  message: string;
  resetToken?: string;
};

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await api.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload
  );
  return data;
}

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
};

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await api.post<ChangePasswordResponse>(
    "/auth/change-password",
    payload
  );
  return data;
}

// UPDATE APIs
export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "admin" | "user";
};

export type UpdateUserResponse = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  updatedAt: string;
};

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const { data } = await api.put<UpdateUserResponse>(
    `/auth/users/${userId}`,
    payload
  );
  return data;
}

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type UpdateProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  updatedAt: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.put<UpdateProfileResponse>(
    "/auth/profile",
    payload
  );
  return data;
}

// DELETE APIs
export type DeleteUserResponse = {
  message: string;
};

export async function deleteUser(userId: string) {
  const { data } = await api.delete<DeleteUserResponse>(
    `/auth/users/${userId}`
  );
  return data;
}

export type DeactivateAccountResponse = {
  message: string;
};

export async function deactivateAccount() {
  const { data } = await api.delete<DeactivateAccountResponse>("/auth/account");
  return data;
}

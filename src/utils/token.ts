export type AuthTokenPayload = {
  userId: string;
  role: string;
  exp?: number;
};

const ACCESS_TOKEN_KEY = "gp_access_token";

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

// Minimal JWT payload decoding (no validation), safe-fails to null
export function decodeTokenPayload(
  token: string | null
): AuthTokenPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function tokenHasExpired(token: string | null): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

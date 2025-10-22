/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  clearAccessToken,
  decodeTokenPayload,
  getAccessToken,
  setAccessToken,
  tokenHasExpired,
} from "@/utils/token";

import { UserRole } from "@/utils/roles";

type AuthUser = {
  userId: string;
  role: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token || tokenHasExpired(token)) {
      clearAccessToken();
      setUser(null);
      setLoading(false);
      return;
    }
    const payload = decodeTokenPayload(token);
    if (payload?.userId && payload?.role) {
      setUser({ userId: payload.userId, role: payload.role });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = useCallback((token: string) => {
    setAccessToken(token);
    const payload = decodeTokenPayload(token);
    if (payload?.userId && payload?.role) {
      setUser({ userId: payload.userId, role: payload.role });
    } else {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!roles || roles.length === 0) return true;
      if (!user?.role) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout, hasRole }),
    [user, loading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function roleForRoute(layout?: string) {
  if (layout === "admin") return UserRole.ADMIN;
  if (layout === "dashboard") return UserRole.USER;
  return undefined;
}

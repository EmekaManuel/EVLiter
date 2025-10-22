import { createAppStore } from "./createAppStore";
import {
  clearAccessToken,
  decodeTokenPayload,
  setAccessToken,
  tokenHasExpired,
  getAccessToken,
} from "@/utils/token";

export type AuthUser = {
  userId: string;
  role: string;
} | null;

type AuthState = {
  user: AuthUser;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
  hydrateFromStorage: () => void;
};

export const authStore = createAppStore<AuthState>(
  (set, get) => ({
    user: null,
    loading: false,
    login: (token: string) => {
      setAccessToken(token);
      const payload = decodeTokenPayload(token);
      if (payload?.userId && payload?.role) {
        set((state) => {
          state.user = { userId: payload.userId, role: payload.role };
        });
      } else {
        set((state) => {
          state.user = null;
        });
      }
    },
    logout: () => {
      clearAccessToken();
      set((state) => {
        state.user = null;
      });
    },
    hasRole: (roles: string[]) => {
      const current = get().user;
      if (!roles || roles.length === 0) return true;
      if (!current?.role) return false;
      return roles.includes(current.role);
    },
    hydrateFromStorage: () => {
      const token = getAccessToken();
      if (!token || tokenHasExpired(token)) {
        clearAccessToken();
        set((state) => {
          state.user = null;
          state.loading = false;
        });
        return;
      }
      const payload = decodeTokenPayload(token);
      if (payload?.userId && payload?.role) {
        set((state) => {
          state.user = { userId: payload.userId, role: payload.role };
          state.loading = false;
        });
      } else {
        set((state) => {
          state.user = null;
          state.loading = false;
        });
      }
    },
  }),
  { name: "auth" }
);

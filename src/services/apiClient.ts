import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearAllTokens,
  tokenHasExpired,
} from "@/utils/token";
import * as authApi from "@/services/api/modules/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 30000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token ?? undefined);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (!token) {
    console.warn("[API Client] No access token found in localStorage");
    return config;
  }

  // Check if token is expired - but don't clear it, let the response interceptor handle refresh
  if (tokenHasExpired(token)) {
    console.warn(
      "[API Client] Token has expired, will attempt refresh on next request"
    );
    // Don't clear token here - let refresh happen in response interceptor
  }

  // Add Authorization header
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;

  // Debug log (remove in production)
  console.log("[API Client] Adding Authorization header to request:", {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenLength: token.length,
  });

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    // Handle 401 Unauthorized - try to refresh token
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Prevent infinite refresh loops
      if (originalRequest.url?.includes("/auth/refresh")) {
        // Refresh token itself failed, clear everything and redirect to login
        clearAllTokens();
        window.dispatchEvent(new Event("evliter:session-expired"));
        window.dispatchEvent(new Event("evliter:unauthorized"));
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, clear and redirect
        clearAllTokens();
        window.dispatchEvent(new Event("evliter:session-expired"));
        window.dispatchEvent(new Event("evliter:unauthorized"));
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await authApi.refresh(refreshToken);
        const { accessToken } = response;

        // Store new access token
        setAccessToken(accessToken);
        // Note: Backend may or may not return a new refresh token
        // If it does in the future, update it here; otherwise keep the existing one

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        console.error("[API Client] Token refresh failed:", refreshError);
        clearAllTokens();
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        window.dispatchEvent(new Event("evliter:session-expired"));
        window.dispatchEvent(new Event("evliter:unauthorized"));
        return Promise.reject(refreshError);
      }
    }

    // Emit custom events for global handlers
    if (!navigator.onLine || error.code === "ERR_NETWORK") {
      window.dispatchEvent(new Event("evliter:network-offline"));
    } else if (status && status >= 500) {
      window.dispatchEvent(
        new CustomEvent("evliter:server-error", { detail: { status } })
      );
    } else if (status === 404) {
      window.dispatchEvent(new CustomEvent("evliter:not-found"));
    }

    return Promise.reject(error);
  }
);

export default api;

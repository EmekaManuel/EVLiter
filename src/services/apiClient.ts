import axios, { AxiosError } from "axios";
import {
  getAccessToken,
  tokenHasExpired,
  clearAccessToken,
} from "@/utils/token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !tokenHasExpired(token)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAccessToken();
      // Dispatch session expired event for modal
      window.dispatchEvent(new Event("gp:session-expired"));
      // Optionally, dispatch a logout event for listeners
      window.dispatchEvent(new Event("gp:unauthorized"));
    }
    // Emit custom events for global handlers
    if (!navigator.onLine || error.code === "ERR_NETWORK") {
      window.dispatchEvent(new Event("gp:network-offline"));
    } else if (status && status >= 500) {
      window.dispatchEvent(
        new CustomEvent("gp:server-error", { detail: { status } })
      );
    } else if (status === 404) {
      window.dispatchEvent(new CustomEvent("gp:not-found"));
    }
    return Promise.reject(error);
  }
);

export default api;

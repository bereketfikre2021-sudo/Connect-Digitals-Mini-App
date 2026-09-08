/**
 * Axios API client — auto-attaches the JWT access token from the auth store.
 * On 401, automatically refreshes the Supabase session once and retries.
 */
import axios from "axios";

const BASE_URL = import.meta.env["VITE_API_URL"] ?? "/api/v1";

export const api = axios.create({ baseURL: BASE_URL });

// Attach token from localStorage on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cd_access_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// On 401, try to refresh the session once then retry the original request.
// Prevents silent failures when the Supabase token expires mid-session.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as import("axios").AxiosError & { _retry?: boolean };
    const config = axiosError.config as (import("axios").InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (axiosError.response?.status === 401 && !config?.["_retry"]) {
      if (config) config["_retry"] = true;
      try {
        const { useAuthStore } = await import("@/store/auth.store");
        await useAuthStore.getState().refreshSession();
        const newToken = localStorage.getItem("cd_access_token");
        if (newToken && config) {
          config.headers["Authorization"] = `Bearer ${newToken}`;
          return api(config);
        }
      } catch {
        const { useAuthStore } = await import("@/store/auth.store");
        useAuthStore.getState().clear();
        // Fall through — reject with the original error so callers see it
      }
    }
    // Always reject so React Query onError handlers fire
    return Promise.reject(error);
  }
);

/** Display ETB cents as "X.XX" */
export function etbDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Short date: "Jan 1, 2025" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

/** Date + time: "Jan 1, 2025, 10:30 AM" */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Relative time: "2 hours ago" */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return formatDate(iso);
}

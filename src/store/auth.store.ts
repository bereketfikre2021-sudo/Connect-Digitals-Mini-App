import { create } from "zustand";
import { api } from "@/lib/api";
import { getTelegramInitData } from "@/lib/telegram";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
    telegramIdentity: { telegramUserId: string; photoUrl: string | null; isPremium: boolean } | null;
    wallet: { balanceETB: number } | null;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshMe: () => Promise<void>;
  clear: () => void;
}

const ACCESS_KEY = "cd_access_token";
const REFRESH_KEY = "cd_refresh_token";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem(ACCESS_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  authenticate: async () => {
    set({ isLoading: true, error: null });
    try {
      const initData = getTelegramInitData();
      const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;

      // ── DEVELOPMENT ONLY ────────────────────────────────────────────────────
      // When running in dev mode without Telegram initData, call the dev-login
      // endpoint to get a real session for the fixed mock user.
      // This code path is EXCLUDED from production builds (Vite tree-shakes it
      // because import.meta.env.DEV is replaced with `false` at build time).
      if (isDev && !initData) {
        // Reuse cached token if still valid
        const cached = localStorage.getItem(ACCESS_KEY);
        if (cached) {
          set({ accessToken: cached, isLoading: false });
          await get().refreshMe();
          if (get().isAuthenticated) return;
          // Token expired — fall through to re-authenticate
          localStorage.removeItem(ACCESS_KEY);
          localStorage.removeItem(REFRESH_KEY);
        }

        // Mint a new dev session
        const { data } = await api.post<{
          success: boolean;
          data: { accessToken: string; refreshToken: string; expiresIn: number; isNew: boolean; isDev: boolean };
        }>("/auth/dev-login");

        localStorage.setItem(ACCESS_KEY, data.data.accessToken);
        localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
        set({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
        await get().refreshMe();
        return;
      }
      // ── END DEVELOPMENT ONLY ────────────────────────────────────────────────

      if (!initData) {
        set({ isLoading: false, error: "Not running inside Telegram" });
        return;
      }

      const { data } = await api.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string; expiresIn: number; isNew: boolean };
      }>("/auth/telegram", { initData });

      localStorage.setItem(ACCESS_KEY, data.data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
      set({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });

      await get().refreshMe();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      set({ isLoading: false, isAuthenticated: false, error: msg });
    }
  },

  refreshSession: async () => {
    const currentRefresh = localStorage.getItem(REFRESH_KEY);
    if (!currentRefresh) { get().clear(); return; }
    try {
      const { data } = await api.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string; expiresIn: number };
      }>("/auth/refresh", { refreshToken: currentRefresh });

      localStorage.setItem(ACCESS_KEY, data.data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
      set({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken });
    } catch {
      get().clear();
    }
  },

  refreshMe: async () => {
    try {
      const { data } = await api.get<{ success: boolean; data: AuthState["user"] }>("/auth/me");
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    } catch {
      // Token may be expired — try refreshing once
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (refreshToken) {
        try {
          await get().refreshSession();
          const { data } = await api.get<{ success: boolean; data: AuthState["user"] }>("/auth/me");
          set({ user: data.data, isAuthenticated: true, isLoading: false });
          return;
        } catch { /* fall through to clear */ }
      }
      get().clear();
    }
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
  },
}));

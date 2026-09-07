import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./index.css";
import "./lib/i18n"; // initialise i18next before first render

// ── Apply Telegram colour-scheme to <html> before first render ────────────────
// Telegram WebApp sets `window.Telegram.WebApp.colorScheme` to "dark" or "light".
// We write `data-theme` on <html> so our CSS selectors can use [data-theme="dark"].
// Falls back to the OS preference if not in Telegram.
(function applyTheme() {
  try {
    const tgScheme = (window as unknown as { Telegram?: { WebApp?: { colorScheme?: string } } })
      ?.Telegram?.WebApp?.colorScheme;
    const scheme = tgScheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", scheme);

    // Keep in sync if user switches theme inside Telegram while the app is open
    window.addEventListener("message", (e) => {
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (msg?.eventType === "theme_changed") {
          const newScheme = (window as unknown as { Telegram?: { WebApp?: { colorScheme?: string } } })
            ?.Telegram?.WebApp?.colorScheme ?? "light";
          document.documentElement.setAttribute("data-theme", newScheme);
        }
      } catch { /* noop */ }
    });
  } catch { /* noop in test/dev */ }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import "./index.css";
import "./lib/i18n"; // initialise i18next before first render

// ── Force light mode — dark mode disabled ────────────────────────────────────
// Always use light mode regardless of Telegram or OS theme preference.
(function applyTheme() {
  document.documentElement.setAttribute("data-theme", "light");
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

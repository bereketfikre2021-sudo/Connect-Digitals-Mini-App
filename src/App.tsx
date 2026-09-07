import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WebApp } from "@/lib/telegram";
import { useAuthStore } from "@/store/auth.store";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { BottomNav } from "@/components/layout/BottomNav";
import { LockIcon, AlertIcon } from "@/components/ui/Icon";

// Pages
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { OrderNewPage } from "@/pages/OrderNewPage";
import { OrderReviewPage } from "@/pages/OrderReviewPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { PaymentMethodSelectPage } from "@/pages/PaymentMethodSelectPage";
import { PaymentInstructionsPage } from "@/pages/PaymentInstructionsPage";
import { PaymentSubmitPage } from "@/pages/PaymentSubmitPage";
import { WalletPayPage } from "@/pages/WalletPayPage";
import { WalletPage } from "@/pages/WalletPage";
import { WalletDepositPage } from "@/pages/WalletDepositPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { SupportPage } from "@/pages/SupportPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ReportPage } from "@/pages/ReportPage";

export function App() {
  const { authenticate, isLoading, isAuthenticated, error } = useAuthStore();

  useEffect(() => {
    try { WebApp.ready(); WebApp.expand(); } catch { /* noop in dev */ }
    authenticate();
  }, [authenticate]);

  // ── DEV-only theme toggle ─────────────────────────────────────────────────
  const [devTheme, setDevTheme] = useState<"light" | "dark">(() => {
    return (document.documentElement.getAttribute("data-theme") as "light" | "dark") ?? "light";
  });
  const toggleTheme = () => {
    const next = devTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    setDevTheme(next);
  };

  if (isLoading) return <FullPageSpinner />;

  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cd-gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LockIcon size={28} color="var(--text-primary)" aria-hidden="true" />
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-xl)", color: "var(--heading-color)" }}>Authentication Required</h2>
        <p style={{ fontSize: "var(--fs-base)", color: "var(--text-secondary)", maxWidth: 280 }}>
          {error ?? "Please open this app through the Connect Digitals Telegram Bot."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* DEV-ONLY banner — tree-shaken in production (import.meta.env.DEV = false) */}
      {import.meta.env.DEV && (
        <div
          role="status"
          aria-label="Development mode — mock user active"
          style={{ background: "#f59e0b", color: "#000", fontSize: "var(--fs-xs)", fontWeight: 700, padding: "3px 8px", letterSpacing: 0.5, position: "sticky", top: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertIcon size={12} color="#000" aria-hidden="true" />
            DEV MODE — Mock User (ID: 999999999)
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.25)", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "#000", letterSpacing: 0.3 }}
          >
            {devTheme === "light" ? "☀ LIGHT" : "☾ DARK"} — toggle
          </button>
        </div>
      )}
      <Routes>
        <Route path="/"                              element={<HomePage />} />
        <Route path="/services"                      element={<ServicesPage />} />
        <Route path="/services/:slug"                element={<ServiceDetailPage />} />
        <Route path="/order/new"                     element={<OrderNewPage />} />
        <Route path="/order/review"                  element={<OrderReviewPage />} />
        <Route path="/orders"                        element={<OrdersPage />} />
        <Route path="/orders/:id"                    element={<OrderDetailPage />} />
        <Route path="/payment/:orderId/method"       element={<PaymentMethodSelectPage />} />
        <Route path="/payment/:orderId/instructions" element={<PaymentInstructionsPage />} />
        <Route path="/payment/:orderId/submit"       element={<PaymentSubmitPage />} />
        <Route path="/payment/:orderId/wallet"       element={<WalletPayPage />} />
        <Route path="/wallet"                        element={<WalletPage />} />
        <Route path="/wallet/deposit"                element={<WalletDepositPage />} />
        <Route path="/reports/:id"                   element={<ReportPage />} />
        <Route path="/profile"                       element={<ProfilePage />} />
        <Route path="/notifications"                 element={<NotificationsPage />} />
        <Route path="/support"                       element={<SupportPage />} />
        <Route path="/404"                           element={<NotFoundPage />} />
        <Route path="*"                              element={<Navigate to="/404" replace />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

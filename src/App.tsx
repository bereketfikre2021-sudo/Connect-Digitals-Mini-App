import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { WebApp } from "@/lib/telegram";
import { getStartParam } from "@/lib/telegram";
import { useAuthStore } from "@/store/auth.store";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { BottomNav } from "@/components/layout/BottomNav";
import { LockIcon, AlertIcon } from "@/components/ui/Icon";

// Pages
import { HomePage } from "@/pages/HomePage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ServiceDetailPage } from "@/pages/ServiceDetailPage";
import { OrderCheckoutPage } from "@/pages/OrderCheckoutPage";
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
  const navigate = useNavigate();

  useEffect(() => {
    try { WebApp.ready(); WebApp.expand(); } catch { /* noop in dev */ }
    authenticate();
  }, [authenticate]);

  // Handle deep link after auth completes
  useEffect(() => {
    if (!isAuthenticated) return;
    const param = getStartParam();
    if (!param) return;
    if (param.startsWith("service_")) {
      navigate(`/services/${param.replace("service_", "")}`, { replace: true });
    } else if (param.startsWith("order_")) {
      navigate(`/orders/${param.replace("order_", "")}`, { replace: true });
    } else if (param === "wallet") {
      navigate("/wallet", { replace: true });
    } else if (param === "deposit") {
      navigate("/wallet/deposit", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ── DEV-only theme toggle removed (dark mode disabled) ──────────────────────

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
      {/* DEV-only banner */}
      {import.meta.env.DEV && (
        <div
          role="status"
          aria-label="Development mode — mock user active"
          style={{ background: "#f59e0b", color: "#000", fontSize: "var(--fs-xs)", fontWeight: 700, padding: "3px 8px", letterSpacing: 0.5, position: "sticky", top: 0, zIndex: 9999, display: "flex", alignItems: "center", gap: 6 }}
        >
          <AlertIcon size={12} color="#000" aria-hidden="true" />
          DEV MODE — Mock User (ID: 999999999)
        </div>
      )}
      <Routes>
        <Route path="/"                              element={<HomePage />} />
        <Route path="/services"                      element={<ServicesPage />} />
        <Route path="/services/:slug"                element={<ServiceDetailPage />} />
        <Route path="/order/new"                     element={<OrderNewPage />} />
        <Route path="/order/checkout"                element={<OrderCheckoutPage />} />
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

import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, etbDisplay } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { WalletIcon, AlertIcon, CheckIcon } from "@/components/ui/Icon";
import { hapticSuccess, hapticError, showConfirm } from "@/lib/telegram";
import { randomUUID } from "./payment-utils";

interface OrderData { id: string; orderNumber: string; totalAmountETB: number; service: { name: string }; package: { name: string } }

export function WalletPayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const { user, refreshMe } = useAuthStore();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<{ success: boolean; data: OrderData }>(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  const walletBalance = user?.wallet?.balanceETB ?? 0;
  const orderTotal    = order?.totalAmountETB ?? 0;
  const sufficient    = walletBalance >= orderTotal;
  const shortfall     = Math.max(0, orderTotal - walletBalance);
  const balanceAfter  = walletBalance - orderTotal;

  const payMutation = useMutation({
    mutationFn: () => api.post("/wallet/pay", { orderId, idempotencyKey: randomUUID() }),
    onSuccess: async () => {
      hapticSuccess();
      await refreshMe();
      navigate(`/orders/${orderId}`, { replace: true });
    },
    onError: () => hapticError(),
  });

  const handlePay = async () => {
    const confirmed = await showConfirm(
      `Pay ${etbDisplay(orderTotal)} ETB from your wallet?\n\nRemaining balance: ${etbDisplay(balanceAfter)} ETB`
    );
    if (confirmed) payMutation.mutate();
  };

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error || !order) return <div className="page"><ErrorMessage message="Order not found" onRetry={() => refetch()} /></div>;

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Pay with Wallet" showBack />

      {/* Order summary */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-4)" }}>
        <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Order Summary</p>
        </div>
        {[
          { label: "Order", value: order.orderNumber },
          { label: "Service", value: order.service.name },
          { label: "Package", value: order.package.name },
        ].map(row => (
          <div key={row.label} className="info-row" style={{ padding: "10px var(--sp-4)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{row.label}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ padding: "var(--sp-4)", borderTop: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--price)" }}>
            {etbDisplay(orderTotal)} ETB
          </span>
        </div>
      </div>

      {/* Wallet balance */}
      <div style={{
        background:    sufficient ? "var(--surface)" : "var(--s-error-bg)",
        border:        `1.5px solid ${sufficient ? "var(--divider)" : "var(--s-error-border)"}`,
        borderRadius:  "var(--r-lg)",
        padding:       "var(--sp-4)",
        marginBottom:  "var(--sp-4)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: sufficient ? 8 : 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
            <WalletIcon size={18} color={sufficient ? "var(--t2)" : "var(--s-error)"} aria-hidden="true" />
            <span style={{ fontSize: "var(--fs-sm)", color: sufficient ? "var(--t2)" : "var(--s-error)", fontWeight: 500 }}>Wallet Balance</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-md)", color: sufficient ? "var(--s-success)" : "var(--s-error)" }}>
            {etbDisplay(walletBalance)} ETB
          </span>
        </div>

        {sufficient && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px var(--sp-3)", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)" }}>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>Balance after payment</span>
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--t1)" }}>
              {etbDisplay(balanceAfter)} ETB
            </span>
          </div>
        )}

        {!sufficient && (
          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", marginTop: 4 }}>
            <AlertIcon size={13} color="var(--s-error)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", lineHeight: "var(--lh-normal)" }}>
              You need {etbDisplay(shortfall)} ETB more to complete this payment.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      {sufficient ? (
        <>
          {payMutation.isError && (
            <div role="alert" style={{ background: "var(--s-error-bg)", border: "1px solid var(--s-error-border)", borderRadius: "var(--r-md)", padding: "12px var(--sp-4)", marginBottom: "var(--sp-4)", fontSize: "var(--fs-sm)", color: "var(--s-error)" }}>
              Payment failed. Please try again.
            </div>
          )}
          <Button variant="primary" size="lg" fullWidth loading={payMutation.isPending} onClick={handlePay}
            icon={<CheckIcon size={16} color="#fff" />}
          >
            Confirm — Pay {etbDisplay(orderTotal)} ETB
          </Button>
        </>
      ) : (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate("/wallet/deposit", { state: { returnTo: `/payment/${orderId}/wallet`, suggestedAmount: Math.ceil(shortfall / 100) } })}
        >
          Top Up Wallet
        </Button>
      )}

      <button
        type="button"
        onClick={() => navigate(`/payment/${orderId}/method`, { replace: true })}
        style={{ display: "block", width: "100%", marginTop: "var(--sp-3)", padding: "var(--sp-3)", background: "none", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", color: "var(--t3)", textAlign: "center", minHeight: 44 }}
      >
        Use a different payment method
      </button>
    </div>
  );
}

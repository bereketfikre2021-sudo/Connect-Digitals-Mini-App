import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, etbDisplay, formatDate } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/Button";
import {
  CheckIcon, CreditCardIcon, SettingsIcon, ZapIcon, BarChartIcon,
  LinkIcon, XIcon, AlertIcon, ClipboardIcon, CoinsIcon,
} from "@/components/ui/Icon";
import { hapticError, hapticSuccess } from "@/lib/telegram";

interface OrderDetail {
  id: string; orderNumber: string; targetUrl: string; targetType: string; quantity: number;
  unitPriceETB: number; totalAmountETB: number; orderStatus: string; paymentStatus: string;
  fulfillmentStatus: string; notes: string | null; createdAt: string; updatedAt: string; completedAt: string | null;
  service: { id: string; name: string; slug: string; targetLabel: string; platform: { name: string; slug: string; iconUrl: string | null } };
  package: { id: string; name: string; quantity: number; priceETB: number; deliveryDaysMin: number; deliveryDaysMax: number };
  payments: Array<{ id: string; status: string; amountETB: number; reference: string; screenshotUrl: string | null; createdAt: string; rejectionReason: string | null }>;
  reports: Array<{ id: string; title: string; publishedAt: string | null }>;
}

const STEPS = [
  { key: "PENDING_PAYMENT",   label: "Order Placed",      Icon: ClipboardIcon },
  { key: "PAYMENT_SUBMITTED", label: "Payment Submitted", Icon: CreditCardIcon },
  { key: "PAYMENT_APPROVED",  label: "Payment Approved",  Icon: CoinsIcon },
  { key: "PROCESSING",        label: "Processing",        Icon: SettingsIcon },
  { key: "IN_PROGRESS",       label: "In Progress",       Icon: ZapIcon },
  { key: "COMPLETED",         label: "Completed",         Icon: CheckIcon },
];

const STATUS_EXPLANATIONS: Record<string, string> = {
  PENDING_PAYMENT:   "Your order is placed. Complete payment below to begin.",
  PAYMENT_SUBMITTED: "Your payment proof has been submitted and is being verified by our team. This usually takes up to 24 hours.",
  PAYMENT_APPROVED:  "Your payment has been confirmed. We're setting up your promotion now.",
  PAYMENT_REJECTED:  "Your payment could not be verified. Please resubmit with a clear screenshot and matching reference number.",
  PROCESSING:        "Your order is being prepared for fulfillment.",
  IN_PROGRESS:       "Your promotion is live and running.",
  COMPLETED:         "Your promotion has been delivered.",
  CANCELLED:         "This order has been cancelled.",
  REFUNDED:          "A refund has been issued to your wallet.",
};

const STATUS_ORDER = STEPS.map(s => s.key);

function ProgressTracker({ currentStatus }: { currentStatus: string }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  return (
    <div style={{ marginBottom: "var(--sp-5)" }}>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-4)" }}>
        Order Progress
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {STEPS.map((step, idx) => {
          const done   = idx <= currentIdx;
          const active = idx === currentIdx;
          const StepIcon = step.Icon;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-3)" }}>
              {/* Icon + connector */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 }}>
                <div style={{
                  width:          32,
                  height:         32,
                  borderRadius:   "50%",
                  background:     done ? "var(--cd-red)" : "var(--surface-sunken)",
                  border:         active ? "2px solid var(--cd-red)" : `1px solid ${done ? "var(--cd-red)" : "var(--divider)"}`,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  boxShadow:      active ? "0 0 0 4px var(--accent-dim)" : "none",
                  transition:     "all 0.2s",
                }}>
                  <StepIcon size={14} color={done ? "#fff" : "var(--t3)"} />
                </div>
                {idx < STEPS.length - 1 && (
                  <div style={{ width: 2, height: 24, background: idx < currentIdx ? "var(--cd-red)" : "var(--divider)", marginTop: 2, marginBottom: 2, transition: "background 0.2s" }} />
                )}
              </div>
              {/* Label */}
              <div style={{ paddingBottom: idx < STEPS.length - 1 ? 24 : 0, paddingTop: 6 }}>
                <span style={{ fontSize: "var(--fs-sm)", fontWeight: active ? 700 : 500, color: done ? "var(--t1)" : "var(--t3)", lineHeight: "var(--lh-tight)" }}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CancelConfirmSheet({ orderNumber, onConfirm, onCancel, isPending }: {
  orderNumber: string; onConfirm: () => void; onCancel: () => void; isPending: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div
        className="animate-slide-up"
        style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "var(--surface)", borderRadius: "var(--r-xl) var(--r-xl) 0 0", padding: "var(--sp-6) var(--sp-5)", paddingBottom: "calc(var(--sp-6) + env(safe-area-inset-bottom))" }}
      >
        <div style={{ width: 36, height: 4, background: "var(--divider)", borderRadius: 2, margin: "0 auto var(--sp-5)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--s-error-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <XIcon size={20} color="var(--s-error)" aria-hidden="true" />
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--t1)" }}>Cancel Order?</h2>
        </div>
        <p style={{ fontSize: "var(--fs-base)", color: "var(--t2)", lineHeight: "var(--lh-normal)", marginBottom: 8 }}>
          You're about to cancel <strong style={{ color: "var(--t1)" }}>{orderNumber}</strong>.
        </p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", lineHeight: "var(--lh-normal)", marginBottom: "var(--sp-6)" }}>
          This action cannot be undone. No payment has been made, so no refund is needed.
        </p>
        <Button variant="danger" size="lg" fullWidth loading={isPending} onClick={onConfirm} style={{ marginBottom: "var(--sp-3)" }}>
          Yes, Cancel Order
        </Button>
        <Button variant="ghost" size="lg" fullWidth onClick={onCancel}>
          Keep Order
        </Button>
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<{ success: boolean; data: OrderDetail }>(`/orders/${id}`).then(r => r.data.data),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: (q) => {
      const s = q.state.data?.orderStatus;
      return s && !["COMPLETED", "CANCELLED", "REFUNDED"].includes(s) ? 30_000 : false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      hapticSuccess();
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      setShowCancelSheet(false);
    },
    onError: () => { hapticError(); setShowCancelSheet(false); },
  });

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error || !order) return <div className="page"><ErrorMessage message="Order not found" onRetry={() => refetch()} /></div>;

  const latestPayment   = order.payments[0];
  const latestReport    = order.reports[0];
  const isCancelled     = ["CANCELLED", "REFUNDED"].includes(order.orderStatus);
  const needsPayment    = order.orderStatus === "PENDING_PAYMENT" || order.orderStatus === "PAYMENT_REJECTED";
  const canCancel       = order.orderStatus === "PENDING_PAYMENT";
  const isRejected      = order.orderStatus === "PAYMENT_REJECTED";
  const explanation     = STATUS_EXPLANATIONS[order.orderStatus];

  return (
    <>
      <div className="page animate-fade-in">
        <PageHeader title={order.orderNumber} subtitle={order.service.name} showBack />

        {/* Status + amount banner */}
        <div style={{
          background:    isCancelled ? "var(--surface)" : "var(--hero-bg)",
          borderRadius:  "var(--r-xl)",
          padding:       "var(--sp-5)",
          marginBottom:  "var(--sp-4)",
          display:       "flex",
          justifyContent:"space-between",
          alignItems:    "center",
          border:        isCancelled ? "1px solid var(--divider)" : "none",
        }}>
          <div>
            <p style={{ fontSize: "var(--fs-xs)", color: isCancelled ? "var(--t3)" : "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Status</p>
            <StatusBadge status={order.orderStatus} />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "var(--fs-xs)", color: isCancelled ? "var(--t3)" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>Total</p>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: isCancelled ? "var(--t1)" : "var(--cd-gold)" }}>
              {etbDisplay(order.totalAmountETB)} ETB
            </p>
          </div>
        </div>

        {/* Status explanation */}
        {explanation && (
          <div style={{
            marginBottom: "var(--sp-4)",
            padding: "12px var(--sp-4)",
            background: isRejected ? "var(--s-error-bg)" : "var(--surface)",
            border: `1px solid ${isRejected ? "var(--s-error-border)" : "var(--divider)"}`,
            borderRadius: "var(--r-md)",
            display: "flex", gap: "var(--sp-2)", alignItems: "flex-start",
          }}>
            <AlertIcon size={14} color={isRejected ? "var(--s-error)" : "var(--t3)"} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <p style={{ fontSize: "var(--fs-sm)", color: isRejected ? "var(--s-error)" : "var(--t2)", lineHeight: "var(--lh-normal)" }}>{explanation}</p>
          </div>
        )}

        {/* Rejection reason */}
        {isRejected && latestPayment?.rejectionReason && (
          <div style={{ marginBottom: "var(--sp-4)", padding: "var(--sp-4)", background: "var(--s-error-bg)", border: "1px solid var(--s-error-border)", borderRadius: "var(--r-md)" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--s-error)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Rejection Reason</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--s-error)", lineHeight: "var(--lh-normal)" }}>{latestPayment.rejectionReason}</p>
          </div>
        )}

        {/* Progress tracker */}
        {!isCancelled && <ProgressTracker currentStatus={order.orderStatus} />}

        {/* Order info */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-3)" }}>
          <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Order Info</p>
          </div>
          {[
            { label: "Service",  value: order.service.name },
            { label: "Package",  value: order.package.name },
            { label: "Quantity", value: order.package.quantity.toLocaleString() },
            { label: "Delivery", value: `${order.package.deliveryDaysMin}–${order.package.deliveryDaysMax} days` },
            { label: "Placed",   value: formatDate(order.createdAt) },
            ...(order.completedAt ? [{ label: "Completed", value: formatDate(order.completedAt) }] : []),
          ].map(row => (
            <div key={row.label} className="info-row" style={{ padding: "10px var(--sp-4)" }}>
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{row.label}</span>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
          <div style={{ padding: "10px var(--sp-4)" }}>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 4 }}>{order.service.targetLabel}</p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <LinkIcon size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <a href={order.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-sm)", color: "var(--accent)", wordBreak: "break-all" }}>
                {order.targetUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Payment */}
        {latestPayment && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-3)" }}>
            <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
              <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Payment</p>
            </div>
            <div style={{ padding: "var(--sp-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: latestPayment.reference ? 8 : 0 }}>
                <StatusBadge status={latestPayment.status} />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-md)", color: "var(--t1)" }}>
                  {etbDisplay(latestPayment.amountETB)} ETB
                </span>
              </div>
              {latestPayment.reference && (
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>Ref: {latestPayment.reference}</p>
              )}
            </div>
          </div>
        )}

        {/* Report */}
        {latestReport && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <BarChartIcon size={14} color="var(--accent)" aria-hidden="true" />
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>Report Available</span>
              </div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>{latestReport.title}</p>
            </div>
            <Button variant="subtle" size="sm" onClick={() => navigate(`/reports/${latestReport.id}`)}>
              View
            </Button>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", marginTop: "var(--sp-2)" }}>
          {needsPayment && (
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate(`/payment/${order.id}/method`)}>
              {isRejected ? "Re-submit Payment" : "Complete Payment"}
            </Button>
          )}
          {canCancel && (
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setShowCancelSheet(true)}
              style={{ color: "var(--s-error)", borderColor: "rgba(220,38,38,0.3)" }}
            >
              Cancel Order
            </Button>
          )}
          {cancelMutation.isError && (
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--s-error)", textAlign: "center" }}>
              Could not cancel. Please try again.
            </p>
          )}
        </div>
      </div>

      {showCancelSheet && (
        <CancelConfirmSheet
          orderNumber={order.orderNumber}
          onConfirm={() => cancelMutation.mutate()}
          onCancel={() => setShowCancelSheet(false)}
          isPending={cancelMutation.isPending}
        />
      )}
    </>
  );
}

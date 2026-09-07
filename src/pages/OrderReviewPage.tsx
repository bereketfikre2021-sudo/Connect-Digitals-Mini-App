import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useOrderStore } from "@/store/order.store";
import { useAuthStore } from "@/store/auth.store";
import { api, etbDisplay } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { hapticSuccess, hapticError } from "@/lib/telegram";
import { LinkIcon, CheckIcon, XIcon } from "@/components/ui/Icon";

interface CreateOrderResponse { success: boolean; data: { id: string; orderNumber: string; totalAmountETB: number } }

function ConfirmSheet({ service, pkg, targetUrl, notes, onConfirm, onCancel, isPending }: {
  service: { name: string; platform: { name: string } };
  pkg: { name: string; quantity: number; priceETB: number; deliveryDaysMin: number; deliveryDaysMax: number };
  targetUrl: string; notes?: string;
  onConfirm: () => void; onCancel: () => void; isPending: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div
        className="animate-slide-up"
        style={{
          width:         "100%",
          maxWidth:      480,
          margin:        "0 auto",
          background:    "var(--surface)",
          borderRadius:  "var(--r-xl) var(--r-xl) 0 0",
          padding:       "var(--sp-6) var(--sp-5)",
          paddingBottom: "calc(var(--sp-6) + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: 36, height: 4, background: "var(--divider)", borderRadius: 2, margin: "0 auto var(--sp-5)" }} />

        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-lg)", fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>
          Confirm Order
        </h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", marginBottom: "var(--sp-5)" }}>
          Review before placing. You'll pay on the next step.
        </p>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--surface-sunken)", borderRadius: "var(--r-md)", overflow: "hidden", marginBottom: "var(--sp-4)" }}>
          {[
            { label: "Platform", value: service.platform.name },
            { label: "Service",  value: service.name },
            { label: "Package",  value: pkg.name },
            { label: "Quantity", value: `${pkg.quantity.toLocaleString()} units` },
            { label: "Delivery", value: `${pkg.deliveryDaysMin}–${pkg.deliveryDaysMax} days` },
            ...(notes ? [{ label: "Notes", value: notes }] : []),
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)", padding: "10px var(--sp-4)", borderBottom: "1px solid var(--divider)" }}>
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
          {targetUrl && (
            <div style={{ padding: "10px var(--sp-4)", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <LinkIcon size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--accent)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>{targetUrl}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--sp-4) 0", borderTop: "1px solid var(--divider)", marginBottom: "var(--sp-5)" }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-base)", color: "var(--t1)" }}>Total</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-2xl)", color: "var(--price)" }}>
            {etbDisplay(pkg.priceETB)} <span style={{ fontSize: "var(--fs-md)" }}>ETB</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: "var(--sp-3)" }}>
          <Button variant="ghost" size="lg" style={{ flex: 1 }} onClick={onCancel} disabled={isPending}>
            <XIcon size={15} aria-hidden="true" /> Back
          </Button>
          <Button variant="primary" size="lg" style={{ flex: 2 }} loading={isPending} onClick={onConfirm}>
            <CheckIcon size={15} aria-hidden="true" /> Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OrderReviewPage() {
  const navigate = useNavigate();
  const { service, selectedPackage, targetUrl, notes, reset } = useOrderStore();
  const { refreshMe } = useAuthStore();
  const [showConfirmSheet, setShowConfirmSheet] = useState(false);

  useEffect(() => { if (!service || !selectedPackage) navigate("/services", { replace: true }); }, [service, selectedPackage, navigate]);

  const createOrder = useMutation({
    mutationFn: () => api.post<CreateOrderResponse>("/orders", {
      packageId: selectedPackage!.id,
      targetUrl,
      targetType: service!.targetType,
      notes: notes || undefined,
    }).then(r => r.data),
    onSuccess: async data => {
      hapticSuccess();
      await refreshMe();
      reset();
      navigate(`/orders/${data.data.id}`, { replace: true });
    },
    onError: () => { hapticError(); setShowConfirmSheet(false); },
  });

  if (!service || !selectedPackage) return null;

  const rows = [
    { label: "Platform", value: service.platform.name },
    { label: "Service",  value: service.name },
    { label: "Package",  value: selectedPackage.name },
    { label: "Quantity", value: `${selectedPackage.quantity.toLocaleString()} units` },
    { label: "Delivery", value: `${selectedPackage.deliveryDaysMin}–${selectedPackage.deliveryDaysMax} days` },
    ...(notes ? [{ label: "Notes", value: notes }] : []),
  ];

  return (
    <>
      <div className="page animate-fade-in">
        <PageHeader title="Review Order" subtitle="Confirm before placing" showBack />

        {/* Details card */}
        <div style={{
          background:    "var(--surface)",
          border:        "1px solid var(--divider)",
          borderRadius:  "var(--r-lg)",
          overflow:      "hidden",
          marginBottom:  "var(--sp-4)",
        }}>
          <div style={{ padding: "var(--sp-3) var(--sp-4)", borderBottom: "1px solid var(--divider)", background: "var(--surface-sunken)" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Order Details
            </p>
          </div>
          {rows.map(row => (
            <div key={row.label} className="info-row" style={{ padding: "10px var(--sp-4)" }}>
              <span style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{row.label}</span>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
          {targetUrl && (
            <div style={{ padding: "10px var(--sp-4)", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <LinkIcon size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--accent)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>{targetUrl}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{
          background:    "var(--surface)",
          border:        "1px solid var(--divider)",
          borderRadius:  "var(--r-lg)",
          padding:       "var(--sp-4)",
          marginBottom:  "var(--sp-5)",
          display:       "flex",
          justifyContent:"space-between",
          alignItems:    "center",
        }}>
          <div>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>Total</p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 2 }}>Payment on next step</p>
          </div>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-2xl)", color: "var(--price)" }}>
            {etbDisplay(selectedPackage.priceETB)} <span style={{ fontSize: "var(--fs-md)" }}>ETB</span>
          </p>
        </div>

        {createOrder.isError && (
          <div style={{ background: "var(--s-error-bg)", border: "1px solid var(--s-error-border)", borderRadius: "var(--r-md)", padding: "12px var(--sp-4)", marginBottom: "var(--sp-4)", fontSize: "var(--fs-sm)", color: "var(--s-error)" }} role="alert">
            Failed to place order. Please try again.
          </div>
        )}

        <Button variant="primary" size="lg" fullWidth onClick={() => setShowConfirmSheet(true)}>
          Review & Place Order
        </Button>
      </div>

      {showConfirmSheet && (
        <ConfirmSheet
          service={service}
          pkg={selectedPackage}
          targetUrl={targetUrl}
          notes={notes || undefined}
          onConfirm={() => createOrder.mutate()}
          onCancel={() => setShowConfirmSheet(false)}
          isPending={createOrder.isPending}
        />
      )}
    </>
  );
}

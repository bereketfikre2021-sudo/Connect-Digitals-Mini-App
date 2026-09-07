import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CopyIcon, AlertIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icon";
import { hapticLight } from "@/lib/telegram";
import { useState } from "react";
import { WebApp } from "@/lib/telegram";

interface PaymentMethod {
  id: string; name: string; accountName: string;
  accountNumber: string; bankName: string | null; instructions: string;
}

export function PaymentInstructionsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const method = location.state?.method as PaymentMethod | undefined;
  const orderAmount = location.state?.orderAmount as number | undefined;

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<{ success: boolean; data: { orderNumber: string; totalAmountETB: number; service: { name: string } } }>(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  const amount = orderAmount ?? order?.totalAmountETB;

  if (!method) { navigate(`/payment/${orderId}/method`, { replace: true }); return null; }

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    hapticLight();
    setCopiedField(label);
    try { WebApp.showAlert(`${label} copied!`); } catch { /* noop */ }
    setTimeout(() => setCopiedField(null), 2000);
  };

  const steps = method.instructions.split("\n").filter(Boolean);

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Payment Instructions" subtitle={method.name} showBack />

      {/* Amount — always visible */}
      <div style={{
        background:    "var(--hero-bg)",
        borderRadius:  "var(--r-xl)",
        padding:       "var(--sp-5)",
        marginBottom:  "var(--sp-5)",
      }}>
        <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          Transfer exactly this amount
        </p>
        {isLoading
          ? <div style={{ height: 44, display: "flex", alignItems: "center" }}><div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%" }} /></div>
          : <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-3xl)", color: "var(--cd-gold)", lineHeight: 1 }}>
              {amount ? etbDisplay(amount) : "—"}
              <span style={{ fontSize: "var(--fs-md)", marginLeft: 8, color: "rgba(255,255,255,0.7)" }}>ETB</span>
            </p>
        }
      </div>

      {/* Warning */}
      <div style={{
        background:   "var(--s-warning-bg)",
        border:       "1px solid var(--s-warning-bg)",
        borderRadius: "var(--r-md)",
        padding:      "var(--sp-3) var(--sp-4)",
        marginBottom: "var(--sp-4)",
        display:      "flex",
        gap:          "var(--sp-2)",
        alignItems:   "flex-start",
      }}>
        <AlertIcon size={14} color="var(--s-warning)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--s-warning)", lineHeight: "var(--lh-normal)", fontWeight: 500 }}>
          Transfer exactly {amount ? etbDisplay(amount) : "the stated"} ETB. Incorrect amounts will delay your order.
        </p>
      </div>

      {/* Account details */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-4)" }}>
        <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>
            {method.bankName ?? method.name} Account
          </p>
        </div>

        {[
          { label: "Account Name",   value: method.accountName },
          { label: "Account Number", value: method.accountNumber },
          ...(method.bankName ? [{ label: "Bank / Service", value: method.bankName }] : []),
        ].map(row => (
          <div key={row.label} style={{ padding: "12px var(--sp-4)", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--sp-3)" }}>
            <div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 2 }}>{row.label}</p>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>{row.value}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(row.value, row.label)}
              aria-label={`Copy ${row.label}`}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          4,
                padding:      "6px 12px",
                background:   copiedField === row.label ? "var(--s-success-bg)" : "var(--accent-dim)",
                color:        copiedField === row.label ? "var(--s-success)" : "var(--accent)",
                border:       "none",
                borderRadius: "var(--r-sm)",
                fontSize:     "var(--fs-xs)",
                fontFamily:   "var(--font-heading)",
                fontWeight:   700,
                cursor:       "pointer",
                flexShrink:   0,
                minHeight:    36,
                transition:   "all 0.15s",
              }}
            >
              {copiedField === row.label
                ? <><CheckIcon size={11} /> Copied</>
                : <><CopyIcon size={11} /> Copy</>
              }
            </button>
          </div>
        ))}
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div style={{ marginBottom: "var(--sp-5)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
            How to Pay
          </p>
          <ol style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", paddingLeft: 0, listStyle: "none" }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: "var(--sp-3)", alignItems: "flex-start" }}>
                <span style={{
                  width:          24, height: 24, borderRadius: "50%",
                  background:     "var(--accent-dim)",
                  color:          "var(--accent)",
                  fontSize:       "var(--fs-xs)",
                  fontFamily:     "var(--font-heading)",
                  fontWeight:     700,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  marginTop:      1,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => navigate(`/payment/${orderId}/submit`, { state: { method, orderAmount: amount } })}
        iconRight={<ArrowRightIcon size={16} color="#fff" />}
      >
        I've Made the Payment
      </Button>
    </div>
  );
}

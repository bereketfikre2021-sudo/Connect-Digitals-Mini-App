import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/Button";
import {
  ChevronRightIcon, WalletIcon, AlertIcon, CopyIcon, CheckIcon, ArrowRightIcon,
  PaymentMethodIcon,
} from "@/components/ui/Icon";
import { hapticLight } from "@/lib/telegram";
import { WebApp } from "@/lib/telegram";

interface PaymentMethod {
  id: string; name: string; description: string | null;
  accountName: string; accountNumber: string;
  bankName: string | null; instructions: string; sortOrder: number;
}

interface OrderData { id: string; orderNumber: string; totalAmountETB: number; service: { name: string } }

const METHOD_COLORS: Record<string, string> = { cbe: "#006341", "commercial bank": "#006341", awash: "#8B0000", telebirr: "#0066CC" };

function getColor(name: string): string {
  const n = name.toLowerCase();
  for (const [key, color] of Object.entries(METHOD_COLORS)) {
    if (n.includes(key)) return color;
  }
  return "var(--cd-red)";
}

/** Parse logoUrl out of the JSON-encoded description field */
function getLogoUrl(description: string | null): string {
  if (!description) return "";
  try {
    const parsed = JSON.parse(description);
    return (parsed.logoUrl as string) ?? "";
  } catch {
    return "";
  }
}

// ─── Expanded method detail card ──────────────────────────────────────────────
function MethodDetail({
  method, color, orderAmount, onContinue, onClose,
}: {
  method: PaymentMethod;
  color: string;
  orderAmount: number;
  onContinue: () => void;
  onClose: () => void;
}) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    hapticLight();
    setCopiedField(label);
    try { WebApp.showAlert(`${label} copied!`); } catch { /* noop */ }
    setTimeout(() => setCopiedField(null), 2500);
  };

  const copyable = [
    { label: "Account Name",   value: method.accountName },
    { label: "Account Number", value: method.accountNumber },
    ...(method.bankName ? [{ label: "Bank / Service", value: method.bankName }] : []),
  ];

  const steps = method.instructions.split("\n").filter(Boolean);

  return (
    <div
      className="animate-slide-up"
      style={{
        background:   "var(--surface)",
        border:       `2px solid ${color}`,
        borderRadius: "var(--r-lg)",
        overflow:     "hidden",
      }}
    >
      {/* Header with amount reminder */}
      <div style={{
        background:  color,
        padding:     "var(--sp-4) var(--sp-5)",
        display:     "flex",
        justifyContent: "space-between",
        alignItems:  "center",
      }}>
        <div>
          <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.75)", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {method.name}
          </p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "#fff" }}>
            Transfer {etbDisplay(orderAmount)} ETB
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
          <PaymentMethodIcon name={method.name} size={40} logoUrl={getLogoUrl(method.description)} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "rgba(255,255,255,0.20)", border: "none", borderRadius: "var(--r-full)", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      </div>

      <div style={{ padding: "var(--sp-4) var(--sp-5)" }}>
        {/* Copyable account fields */}
        <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
          Account Details
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
          {copyable.map(row => {
            const copied = copiedField === row.label;
            return (
              <div
                key={row.label}
                style={{
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent:"space-between",
                  gap:           "var(--sp-3)",
                  padding:       "12px var(--sp-4)",
                  background:    "var(--surface-sunken)",
                  borderRadius:  "var(--r-md)",
                  border:        `1px solid ${copied ? color : "var(--divider)"}`,
                  transition:    "border-color 0.2s",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 3 }}>{row.label}</p>
                  <p style={{
                    fontFamily:  row.label === "Account Number" ? "var(--font-mono)" : "var(--font-body)",
                    fontWeight:  700,
                    fontSize:    row.label === "Account Number" ? "var(--fs-md)" : "var(--fs-base)",
                    color:       "var(--t1)",
                    letterSpacing: row.label === "Account Number" ? 1 : 0,
                    wordBreak:   "break-all",
                  }}>
                    {row.value}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(row.value, row.label)}
                  aria-label={`Copy ${row.label}`}
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            4,
                    padding:        "7px 12px",
                    background:     copied ? `${color}18` : "var(--surface)",
                    color:          copied ? color : "var(--t3)",
                    border:         `1px solid ${copied ? color : "var(--divider)"}`,
                    borderRadius:   "var(--r-md)",
                    fontSize:       "var(--fs-xs)",
                    fontFamily:     "var(--font-heading)",
                    fontWeight:     700,
                    cursor:         "pointer",
                    flexShrink:     0,
                    minHeight:      36,
                    minWidth:       72,
                    justifyContent: "center",
                    transition:     "all 0.2s",
                  }}
                >
                  {copied
                    ? <><CheckIcon size={12} /> Copied</>
                    : <><CopyIcon size={12} /> Copy</>
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* How to pay steps */}
        {steps.length > 0 && (
          <>
            <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
              How to Pay
            </p>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-5)" }}>
              {steps.map((step, i) => (
                <li key={i} style={{ display: "flex", gap: "var(--sp-3)", alignItems: "flex-start" }}>
                  <span style={{
                    width:          22, height: 22, borderRadius: "50%",
                    background:     `${color}18`,
                    color:          color,
                    fontSize:       "var(--fs-xs)",
                    fontFamily:     "var(--font-heading)",
                    fontWeight:     700,
                    display:        "flex", alignItems: "center", justifyContent: "center",
                    flexShrink:     0, marginTop: 1,
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>{step}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onContinue}
          iconRight={<ArrowRightIcon size={16} color="#fff" />}
        >
          I've Made the Transfer
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function PaymentMethodSelectPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const { user }    = useAuthStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<{ success: boolean; data: OrderData }>(`/orders/${orderId}`).then(r => r.data.data),
    enabled: !!orderId,
  });

  const { data: methods, isLoading, error, refetch } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.get<{ success: boolean; data: PaymentMethod[] }>("/payment-methods").then(r => r.data.data),
  });

  const walletBalance    = user?.wallet?.balanceETB ?? 0;
  const orderAmount      = order?.totalAmountETB ?? 0;
  const walletSufficient = walletBalance >= orderAmount;

  const handleContinue = (method: PaymentMethod) => {
    hapticLight();
    navigate(`/payment/${orderId}/submit`, { state: { method, orderAmount } });
  };

  const handleExpand = (method: PaymentMethod) => {
    hapticLight();
    setExpandedId(prev => prev === method.id ? null : method.id);
  };

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Pay for Order" showBack />

      {/* Amount banner */}
      {order && (
        <div style={{
          background:   "var(--hero-bg)",
          borderRadius: "var(--r-xl)",
          padding:      "var(--sp-5)",
          marginBottom: "var(--sp-5)",
        }}>
          <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {order.orderNumber}
          </p>
          <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Amount to pay</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-3xl)", color: "var(--cd-gold)", lineHeight: 1 }}>
            {etbDisplay(orderAmount)}
            <span style={{ fontSize: "var(--fs-md)", marginLeft: 6, color: "rgba(255,255,255,0.7)" }}>ETB</span>
          </p>
        </div>
      )}

      {/* Wallet option */}
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-2)" }}>
          Pay Instantly
        </p>
        <button
          onClick={() => walletSufficient && navigate(`/payment/${orderId}/wallet`)}
          disabled={!walletSufficient}
          aria-label={walletSufficient ? "Pay with wallet" : "Wallet balance insufficient"}
          style={{
            width: "100%", background: walletSufficient ? "var(--hero-bg)" : "var(--surface)",
            border: `1.5px solid ${walletSufficient ? "var(--cd-red)" : "var(--divider)"}`,
            borderRadius: "var(--r-lg)", padding: "var(--sp-4)", textAlign: "left",
            cursor: walletSufficient ? "pointer" : "default",
            display: "flex", alignItems: "center", gap: "var(--sp-4)",
            opacity: walletSufficient ? 1 : 0.7,
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", background: walletSufficient ? "rgba(255,255,255,0.15)" : "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <WalletIcon size={22} color={walletSufficient ? "#fff" : "var(--t3)"} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: walletSufficient ? "#fff" : "var(--t1)", marginBottom: 3 }}>
              Pay with Wallet
            </p>
            <p style={{ fontSize: "var(--fs-sm)", color: walletSufficient ? "rgba(255,255,255,0.7)" : "var(--t3)" }}>
              Balance: {etbDisplay(walletBalance)} ETB
            </p>
          </div>
          {walletSufficient
            ? <ChevronRightIcon size={18} color="rgba(255,255,255,0.7)" aria-hidden="true" />
            : (
              <button type="button" onClick={e => { e.stopPropagation(); navigate("/wallet/deposit"); }}
                style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "none", borderRadius: "var(--r-sm)", padding: "6px 10px", fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Top Up
              </button>
            )
          }
        </button>

        {!walletSufficient && orderAmount > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, padding: "8px var(--sp-3)", background: "var(--s-warning-bg)", borderRadius: "var(--r-sm)" }}>
            <AlertIcon size={12} color="var(--s-warning)" aria-hidden="true" />
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--s-warning)" }}>
              You need {etbDisplay(orderAmount - walletBalance)} ETB more.
            </p>
          </div>
        )}
      </div>

      {/* Bank/mobile methods */}
      <div>
        <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-2)" }}>
          Bank Transfer
        </p>

        {isLoading && <Spinner />}
        {error && <ErrorMessage message="Failed to load payment methods" onRetry={() => refetch()} />}

        {methods && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {methods.map(method => {
              const color = getColor(method.name);
              const isExpanded = expandedId === method.id;

              return (
                <div key={method.id}>
                  {/* Collapsed card — tap to expand */}
                  {!isExpanded && (
                    <button
                      onClick={() => handleExpand(method)}
                      aria-label={`Select ${method.name}`}
                      aria-expanded={false}
                      style={{
                        width:        "100%",
                        background:   "var(--surface)",
                        border:       "1.5px solid var(--divider)",
                        borderRadius: "var(--r-lg)",
                        padding:      "var(--sp-4)",
                        textAlign:    "left",
                        cursor:       "pointer",
                        display:      "flex",
                        alignItems:   "center",
                        gap:          "var(--sp-4)",
                        transition:   "border-color 0.15s",
                      }}
                    >
                      {/* Brand logo */}
                      <PaymentMethodIcon name={method.name} size={44} logoUrl={getLogoUrl(method.description)} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)", marginBottom: 2 }}>
                          {method.name}
                        </p>
                        {/* Masked account number — teases the detail */}
                        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
                          {"•".repeat(Math.max(0, method.accountNumber.length - 4))}{method.accountNumber.slice(-4)}
                        </p>
                      </div>

                      {/* "Tap to view" hint */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <div style={{ background: `${color}18`, borderRadius: "var(--r-sm)", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                          <CopyIcon size={11} color={color} aria-hidden="true" />
                          <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "var(--font-heading)" }}>View & Copy</span>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Expanded detail */}
                  {isExpanded && (
                    <MethodDetail
                      method={method}
                      color={color}
                      orderAmount={orderAmount}
                      onContinue={() => handleContinue(method)}
                      onClose={() => setExpandedId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

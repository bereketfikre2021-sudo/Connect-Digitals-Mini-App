import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useOrderStore } from "@/store/order.store";
import { useAuthStore } from "@/store/auth.store";
import { api, etbDisplay } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  WalletIcon, AlertIcon, CopyIcon, CheckIcon,
  ArrowRightIcon, TagIcon, LinkIcon, InfoIcon,
  UploadIcon, XIcon, PaymentMethodIcon,
} from "@/components/ui/Icon";
import { hapticLight, hapticSuccess, hapticError, WebApp } from "@/lib/telegram";
import { randomUUID } from "./payment-utils";

// ─── types ────────────────────────────────────────────────────────────────────

interface PaymentMethod {
  id: string; name: string; description: string | null;
  accountName: string; accountNumber: string;
  bankName: string | null; instructions: string; sortOrder: number;
}
interface CreateOrderResponse {
  success: boolean;
  data: { id: string; orderNumber: string; totalAmountETB: number };
}
interface PromoResult {
  valid: boolean; reason?: string;
  discountPercent?: number; discountETB?: number; finalAmountETB?: number;
}

// ─── page state machine ───────────────────────────────────────────────────────

type Stage =
  | { type: "checkout" }
  | { type: "submitting"; label: string }
  | { type: "success";  orderId: string; orderNumber: string }
  | { type: "error";    message: string };

// ─── helpers ─────────────────────────────────────────────────────────────────

const COLORS: Record<string, string> = {
  cbe: "#006341", "commercial bank": "#006341", awash: "#8B0000", telebirr: "#0066CC",
};
function methodColor(name: string) {
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(COLORS)) if (n.includes(k)) return v;
  return "#EC1C24";
}
function logoUrl(desc: string | null) {
  if (!desc) return "";
  try { return (JSON.parse(desc) as { logoUrl?: string }).logoUrl ?? ""; } catch { return ""; }
}

// ─── sub-components ───────────────────────────────────────────────────────────

function CopyRow({ label, value, color }: { label: string; value: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    hapticLight();
    setCopied(true);
    try { WebApp.showAlert(`${label} copied!`); } catch { /**/ }
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", background: "var(--surface-sunken)", borderRadius: 12, border: `1px solid ${copied ? color : "var(--divider)"}` }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 3 }}>{label}</p>
        <p style={{ fontFamily: label === "Account Number" ? "var(--font-mono)" : undefined, fontWeight: 700, fontSize: 15, color: "var(--t1)", wordBreak: "break-all" }}>{value}</p>
      </div>
      <button type="button" onClick={copy} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: copied ? `${color}18` : "var(--surface)", color: copied ? color : "var(--t3)", border: `1px solid ${copied ? color : "var(--divider)"}`, borderRadius: 10, fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 700, cursor: "pointer", minHeight: 36, minWidth: 70 }}>
        {copied ? <><CheckIcon size={11} />Copied</> : <><CopyIcon size={11} />Copy</>}
      </button>
    </div>
  );
}

function ProofUpload({ orderAmount, methodName, onReady }: {
  orderAmount: number;
  methodName: string;
  onReady: (key: string | null, date: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [key,      setKey]      = useState<string | null>(null);
  const [uploading,setUploading]= useState(false);
  const [upErr,    setUpErr]    = useState<string | null>(null);
  const [date,     setDate]     = useState(today);
  const ref = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUpErr(null);
    if (f.size > 10 * 1024 * 1024) { setUpErr("File must be under 10 MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("screenshot", f);
      const res = await api.post<{ success: boolean; data: { key: string } }>(
        "/payments/upload-proof", fd, { headers: { "Content-Type": "multipart/form-data" } }
      );
      const k = res.data.data.key; setKey(k); onReady(k, date);
    } catch { setUpErr("Upload failed. Try again."); setPreview(null); }
    finally { setUploading(false); }
  };

  const onDate = (v: string) => { setDate(v); onReady(key, v); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* amount */}
      <div style={{ background: "var(--hero-bg)", borderRadius: 20, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Transfer to {methodName}</p>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--cd-gold)" }}>{etbDisplay(orderAmount)} ETB</p>
      </div>
      {/* date */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)", marginBottom: 6 }}>
          Transfer Date <span style={{ color: "#EC1C24" }}>*</span>
        </label>
        <input type="date" value={date} max={today} onChange={e => onDate(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--input-border)", borderRadius: 12, fontSize: 15, background: "var(--input-bg)", color: "var(--input-text)", outline: "none" }} />
      </div>
      {/* screenshot */}
      <div>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)", marginBottom: 8 }}>
          Payment Screenshot <span style={{ fontWeight: 400, color: "var(--t3)", fontSize: 11 }}>(recommended)</span>
        </p>
        {preview ? (
          <div style={{ position: "relative" }}>
            <img src={preview} alt="proof" style={{ width: "100%", borderRadius: 12, aspectRatio: "3/4", objectFit: "cover", border: "1px solid var(--divider)", display: "block" }} />
            <div role="button" tabIndex={0} onClick={() => { setPreview(null); setKey(null); onReady(null, date); }} aria-label="Remove"
              style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <XIcon size={14} color="#fff" />
            </div>
            <div style={{ position: "absolute", bottom: 8, left: 8, background: "#f0fdf4", border: "1px solid #16a34a", borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckIcon size={11} color="#16a34a" /><span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>Uploaded</span>
            </div>
          </div>
        ) : (
          <div role="button" tabIndex={0} onClick={() => !uploading && ref.current?.click()} aria-label="Upload screenshot"
            style={{ width: "100%", aspectRatio: "3/4", border: "2px dashed var(--divider)", borderRadius: 16, background: "var(--surface)", cursor: uploading ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {uploading
              ? <div className="animate-spin" style={{ width: 28, height: 28, border: "2.5px solid var(--divider)", borderTopColor: "#EC1C24", borderRadius: "50%" }} />
              : <><UploadIcon size={28} color="var(--t3)" /><p style={{ fontSize: 15, color: "var(--t2)", fontWeight: 500 }}>Tap to upload</p><p style={{ fontSize: 11, color: "var(--t3)" }}>JPEG · PNG · WebP · Max 10 MB</p></>}
          </div>
        )}
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} style={{ display: "none" }} />
        {upErr && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{upErr}</p>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: 12 }}>
        <InfoIcon size={14} color="#EC1C24" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>Our team verifies payment within 24 hours and notifies you via Telegram.</p>
      </div>
    </div>
  );
}

// ─── redirect helper (avoids calling navigate() during render) ────────────────
function RedirectToServices() {
  return <Navigate to="/services" replace />;
}

// ─── main page ────────────────────────────────────────────────────────────────

export function OrderCheckoutPage() {
  const navigate = useNavigate();
  const { service, selectedPackage, targetUrl, notes, reset } = useOrderStore();
  const { user, refreshMe } = useAuthStore();

  // ALL hooks before any conditional return
  const [stage,           setStage]          = useState<Stage>({ type: "checkout" });
  const [expandedId,      setExpandedId]     = useState<string | null>(null);
  const [promoCode,       setPromoCode]      = useState("");
  const [promoResult,     setPromoResult]    = useState<PromoResult | null>(null);
  const [promoChecking,   setPromoChecking]  = useState(false);
  const [proofKey,        setProofKey]       = useState<string | null>(null);
  const [proofDate,       setProofDate]      = useState(new Date().toISOString().slice(0, 10));

  const walletBalance = user?.wallet?.balanceETB ?? 0;
  const basePrice     = selectedPackage?.priceETB ?? 0;
  const finalPrice    = promoResult?.valid && promoResult.finalAmountETB != null
    ? promoResult.finalAmountETB : basePrice;
  const walletOk = walletBalance >= finalPrice;

  const { data: methods, isLoading: loadingMethods, error: methodsErr, refetch } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => api.get<{ success: boolean; data: PaymentMethod[] }>("/payment-methods").then(r => r.data.data),
  });

  // guard — skip when we have a result to show (store gets cleared on success)
  if ((!service || !selectedPackage) && stage.type === "checkout") {
    return <RedirectToServices />;
  }

  // ── promo ──────────────────────────────────────────────────────────────────
  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoChecking(true); setPromoResult(null);
    try {
      const r = await api.post<{ success: boolean; data: PromoResult }>("/promo-codes/validate", {
        code: promoCode.trim().toUpperCase(), amountETB: basePrice,
      });
      setPromoResult(r.data.data);
    } catch { setPromoResult({ valid: false, reason: "Failed to validate. Try again." }); }
    finally { setPromoChecking(false); }
  };

  // ── submit helpers ─────────────────────────────────────────────────────────
  // Use non-null assertions — these are safe because the guard above ensures
  // service and selectedPackage are non-null whenever stage === "checkout"
  const buildOrderBody = () => ({
    packageId:  selectedPackage!.id,
    targetUrl,
    targetType: service!.targetType,
    notes:      notes || undefined,
    promoCode:  promoResult?.valid ? promoCode.trim().toUpperCase() : undefined,
  });

  const handleWalletPay = async () => {
    setStage({ type: "submitting", label: "Processing payment…" });
    try {
      const orderRes = await api.post<CreateOrderResponse>("/orders", buildOrderBody());
      const { id: orderId, orderNumber } = orderRes.data.data;
      await api.post("/wallet/pay", { orderId, idempotencyKey: randomUUID() });
      hapticSuccess();
      refreshMe().catch(() => {});
      setStage({ type: "success", orderId, orderNumber });
      reset();
    } catch (err: unknown) {
      hapticError();
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Payment failed. Please try again.";
      setStage({ type: "error", message: msg });
    }
  };

  const handleBankPay = async (method: PaymentMethod) => {
    setStage({ type: "submitting", label: "Placing order…" });
    try {
      const orderRes = await api.post<CreateOrderResponse>("/orders", buildOrderBody());
      const { id: orderId, orderNumber, totalAmountETB } = orderRes.data.data;
      await api.post("/payments", {
        orderId,
        paymentMethodId: method.id,
        amountETB:       totalAmountETB,
        reference:       proofDate,
        screenshotKey:   proofKey ?? undefined,
        idempotencyKey:  randomUUID(),
      });
      hapticSuccess();
      refreshMe().catch(() => {});
      setStage({ type: "success", orderId, orderNumber });
      reset();
    } catch (err: unknown) {
      hapticError();
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? "Submission failed. Please try again.";
      setStage({ type: "error", message: msg });
    }
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (stage.type === "success") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 24, textAlign: "center", background: "var(--bg)" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#f0fdf4", border: "3px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckIcon size={44} color="#16a34a" />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: "var(--t1)", marginBottom: 12 }}>
            Order Submitted Successfully
          </h2>
          <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, maxWidth: 280 }}>
            We will notify you as soon as your payment is approved and your order is confirmed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/orders", { replace: true })}
          style={{ width: "100%", maxWidth: 320, minHeight: 56, background: "#EC1C24", color: "#fff", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 4px 18px rgba(236,28,36,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Track My Orders
        </button>
      </div>
    );
  }

  // ── ERROR SCREEN ───────────────────────────────────────────────────────────
  if (stage.type === "error") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 24, textAlign: "center", background: "var(--bg)" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#fef2f2", border: "3px solid #dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <XIcon size={44} color="#dc2626" />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 800, color: "var(--t1)", marginBottom: 8 }}>Something Went Wrong</h2>
          <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.6 }}>{stage.message}</p>
        </div>
        <button type="button" onClick={() => setStage({ type: "checkout" })}
          style={{ width: "100%", maxWidth: 320, minHeight: 56, background: "#EC1C24", color: "#fff", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 4px 18px rgba(236,28,36,0.4)" }}>
          Try Again
        </button>
        <button type="button" onClick={() => navigate("/orders")}
          style={{ background: "none", border: "none", color: "var(--t3)", fontSize: 13, cursor: "pointer" }}>
          View my orders
        </button>
      </div>
    );
  }

  // ── SUBMITTING OVERLAY ─────────────────────────────────────────────────────
  if (stage.type === "submitting") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, background: "var(--bg)" }}>
        <div className="animate-spin" style={{ width: 52, height: 52, border: "4px solid var(--divider)", borderTopColor: "#EC1C24", borderRadius: "50%" }} />
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--t1)" }}>{stage.label}</p>
      </div>
    );
  }

  // ── CHECKOUT SCREEN ────────────────────────────────────────────────────────
  // At this point service and selectedPackage are guaranteed non-null (guard above)
  const svc = service!;
  const pkg = selectedPackage!;

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Checkout" subtitle={svc.name} showBack />

      {/* Order summary */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: 18, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--divider)", background: "var(--surface-sunken)" }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Order Summary</p>
        </div>
        {[
          { label: "Platform", value: svc.platform.name },
          { label: "Service",  value: svc.name },
          { label: "Package",  value: pkg.name },
          { label: "Quantity", value: `${pkg.quantity.toLocaleString()} units` },
          { label: "Delivery", value: `${pkg.deliveryDaysMin}–${pkg.deliveryDaysMax} days` },
          ...(notes ? [{ label: "Notes", value: notes }] : []),
        ].map(r => (
          <div key={r.label} className="info-row" style={{ padding: "10px 16px" }}>
            <span style={{ fontSize: 13, color: "var(--t3)" }}>{r.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{r.value}</span>
          </div>
        ))}
        {targetUrl && (
          <div style={{ padding: "10px 16px", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <LinkIcon size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 11, color: "var(--accent)", wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>{targetUrl}</span>
          </div>
        )}
      </div>

      {/* Promo code */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: 18, padding: 16, marginBottom: 12 }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <TagIcon size={14} color="var(--accent)" /> Promo Code
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
            placeholder="Enter code (optional)"
            style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${promoResult?.valid ? "#16a34a" : "var(--input-border)"}`, borderRadius: 10, fontSize: 13, background: "var(--input-bg)", color: "var(--input-text)", outline: "none", textTransform: "uppercase" }} />
          <Button variant="subtle" size="md" loading={promoChecking} onClick={applyPromo} disabled={!promoCode.trim()}>Apply</Button>
        </div>
        {promoResult && (
          <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: promoResult.valid ? "#16a34a" : "#dc2626" }}>
            {promoResult.valid ? `✓ ${promoResult.discountPercent}% off — saving ${etbDisplay(promoResult.discountETB!)} ETB` : promoResult.reason}
          </p>
        )}
      </div>

      {/* Total */}
      <div style={{ background: "var(--hero-bg)", borderRadius: 20, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Total to pay</p>
          {promoResult?.valid && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{etbDisplay(basePrice)} ETB</p>}
        </div>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 34, color: "var(--cd-gold)", lineHeight: 1 }}>
          {etbDisplay(finalPrice)} <span style={{ fontSize: 15, color: "rgba(255,255,255,0.65)" }}>ETB</span>
        </p>
      </div>

      {/* Payment methods label */}
      <p style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
        Choose Payment Method
      </p>

      {/* Wallet */}
      <div style={{ marginBottom: 12 }}>
        {walletOk ? (
          <button type="button" onClick={handleWalletPay}
            style={{ width: "100%", minHeight: 56, background: "var(--hero-bg)", border: "none", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WalletIcon size={22} color="#fff" />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 2 }}>Pay with Wallet</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>Balance: {etbDisplay(walletBalance)} ETB → {etbDisplay(walletBalance - finalPrice)} ETB remaining</p>
            </div>
            <CheckIcon size={18} color="rgba(255,255,255,0.7)" />
          </button>
        ) : (
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--divider)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 14, opacity: 0.7 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <WalletIcon size={22} color="var(--t3)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--t1)", marginBottom: 2 }}>Pay with Wallet</p>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>Balance: {etbDisplay(walletBalance)} ETB</p>
            </div>
            <button type="button" onClick={() => navigate("/wallet/deposit")}
              style={{ background: "rgba(236,28,36,0.1)", color: "#EC1C24", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Top Up
            </button>
          </div>
        )}
        {!walletOk && finalPrice > 0 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6, padding: "7px 12px", background: "var(--s-warning-bg)", borderRadius: 8 }}>
            <AlertIcon size={12} color="var(--s-warning)" />
            <p style={{ fontSize: 11, color: "var(--s-warning)" }}>You need {etbDisplay(finalPrice - walletBalance)} ETB more.</p>
          </div>
        )}
      </div>

      {/* Bank methods */}
      {loadingMethods && <Spinner />}
      {methodsErr && <ErrorMessage message="Failed to load payment methods" onRetry={() => refetch()} />}

      {methods && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {methods.map(method => {
            const color   = methodColor(method.name);
            const isOpen  = expandedId === method.id;

            return (
              <div key={method.id}>
                {!isOpen ? (
                  <button type="button" onClick={() => { hapticLight(); setExpandedId(method.id); }}
                    style={{ width: "100%", background: "var(--surface)", border: "1.5px solid var(--divider)", borderRadius: 16, padding: 16, textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
                    <PaymentMethodIcon name={method.name} size={44} logoUrl={logoUrl(method.description)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "var(--t1)", marginBottom: 2 }}>{method.name}</p>
                      <p style={{ fontSize: 12, color: "var(--t3)", fontFamily: "var(--font-mono)" }}>{"•".repeat(Math.max(0, method.accountNumber.length - 4))}{method.accountNumber.slice(-4)}</p>
                    </div>
                    <div style={{ background: `${color}18`, borderRadius: 6, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <ArrowRightIcon size={12} color={color} />
                      <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "var(--font-heading)" }}>Select</span>
                    </div>
                  </button>
                ) : (
                  <div>
                    {/* expanded header */}
                    <div style={{ background: color, borderRadius: "16px 16px 0 0", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginBottom: 2, textTransform: "uppercase" }}>{method.name}</p>
                        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "#fff" }}>Transfer {etbDisplay(finalPrice)} ETB</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PaymentMethodIcon name={method.name} size={38} logoUrl={logoUrl(method.description)} />
                        <button type="button" onClick={() => setExpandedId(null)}
                          style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    </div>

                    {/* account details */}
                    <div style={{ background: "var(--surface)", border: `2px solid ${color}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Account Details</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <CopyRow label="Account Name"   value={method.accountName}   color={color} />
                          <CopyRow label="Account Number" value={method.accountNumber} color={color} />
                          {method.bankName && <CopyRow label="Bank / Service" value={method.bankName} color={color} />}
                        </div>
                      </div>

                      {/* steps */}
                      {method.instructions.split("\n").filter(Boolean).length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>How to Pay</p>
                          <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                            {method.instructions.split("\n").filter(Boolean).map((step, i) => (
                              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}18`, color, fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                                <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.5 }}>{step}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* proof upload */}
                      <ProofUpload
                        orderAmount={finalPrice}
                        methodName={method.name}
                        onReady={(k, d) => { setProofKey(k); setProofDate(d); }}
                      />

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => handleBankPay(method)}
                        style={{ width: "100%", minHeight: 60, background: "#EC1C24", color: "#fff", border: "none", borderRadius: 16, fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 4px 18px rgba(236,28,36,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <CheckIcon size={18} color="#fff" />
                        Place Order &amp; Submit Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

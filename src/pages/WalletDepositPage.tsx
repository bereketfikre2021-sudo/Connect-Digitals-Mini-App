import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, etbDisplay } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { hapticSuccess, hapticError, hapticLight } from "@/lib/telegram";
import { randomUUID } from "./payment-utils";
import { InfoIcon, CopyIcon, CheckIcon, UploadIcon, XIcon, PaymentMethodIcon } from "@/components/ui/Icon";
import { WebApp } from "@/lib/telegram";

interface PaymentMethod {
  id: string; name: string; description: string | null;
  accountName: string; accountNumber: string; bankName: string | null; instructions: string;
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

const schema = z.object({
  paymentMethodId: z.string().min(1, "Select a payment method"),
  amountETB:       z.number({ invalid_type_error: "Enter an amount" }).int().min(50, "Minimum deposit is 50 ETB"),
  transferDate:    z.string().min(1, "Transfer date is required"),
});
type FormValues = z.infer<typeof schema>;

// ─── Expandable method card ───────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  cbe: "#006341", "commercial bank": "#006341",
  awash: "#8B0000",
  telebirr: "#0066CC",
};

function getColor(name: string): string {
  const n = name.toLowerCase();
  for (const [key, color] of Object.entries(METHOD_COLORS)) {
    if (n.includes(key)) return color;
  }
  return "var(--cd-red)";
}

function MethodCard({
  method, isSelected, isExpanded, onSelect, onToggle,
}: {
  method: PaymentMethod; isSelected: boolean; isExpanded: boolean;
  onSelect: () => void; onToggle: () => void;
}) {
  const color = getColor(method.name);
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
    ...(method.bankName ? [{ label: "Bank", value: method.bankName }] : []),
  ];

  const steps = method.instructions.split("\n").filter(Boolean);

  return (
    <div style={{
      border:       `2px solid ${isSelected ? color : "var(--divider)"}`,
      borderRadius: "var(--r-lg)",
      overflow:     "hidden",
      background:   "var(--surface)",
      transition:   "border-color 0.2s",
    }}>
      {/* Header row — tap to select + expand */}
      <button
        type="button"
        onClick={() => { onSelect(); onToggle(); }}
        aria-expanded={isExpanded}
        aria-label={`${method.name} — tap to ${isExpanded ? "collapse" : "view account details"}`}
        style={{
          width:      "100%",
          padding:    "var(--sp-3) var(--sp-4)",
          background: isSelected ? `${color}10` : "transparent",
          border:     "none",
          textAlign:  "left",
          cursor:     "pointer",
          display:    "flex",
          alignItems: "center",
          gap:        "var(--sp-3)",
          transition: "background 0.15s",
        }}
      >
        {/* Selection ring */}
        <div style={{
          width:      22, height: 22, borderRadius: "50%",
          border:     `2px solid ${isSelected ? color : "var(--divider)"}`,
          background: isSelected ? color : "transparent",
          display:    "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.15s",
        }}>
          {isSelected && <CheckIcon size={11} color="#fff" />}
        </div>

        {/* Brand logo */}
        <PaymentMethodIcon name={method.name} size={44} logoUrl={getLogoUrl(method.description)} />

        {/* Name + masked number */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)", marginBottom: 2 }}>
            {method.name}
          </p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>
            {"•".repeat(Math.max(0, method.accountNumber.length - 4))}{method.accountNumber.slice(-4)}
          </p>
        </div>

        {/* View chip */}
        <div style={{ background: `${color}18`, borderRadius: "var(--r-sm)", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <CopyIcon size={10} color={color} aria-hidden="true" />
          <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "var(--font-heading)" }}>
            {isExpanded ? "Hide" : "View"}
          </span>
        </div>
      </button>

      {/* Expanded account details */}
      {isExpanded && (
        <div className="animate-fade-in" style={{ borderTop: `1px solid ${color}30`, padding: "var(--sp-4) var(--sp-4) var(--sp-5)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
            Account Details
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            {copyable.map(row => {
              const copied = copiedField === row.label;
              return (
                <div key={row.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: "var(--sp-3)", padding: "11px var(--sp-4)",
                  background: "var(--surface-sunken)", borderRadius: "var(--r-md)",
                  border: `1px solid ${copied ? color : "var(--divider)"}`,
                  transition: "border-color 0.2s",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 3 }}>{row.label}</p>
                    <p style={{
                      fontFamily:    row.label === "Account Number" ? "var(--font-mono)" : "var(--font-body)",
                      fontWeight:    700,
                      fontSize:      row.label === "Account Number" ? "var(--fs-md)" : "var(--fs-base)",
                      color:         "var(--t1)",
                      letterSpacing: row.label === "Account Number" ? 1.2 : 0,
                      wordBreak:     "break-all",
                    }}>
                      {row.value}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(row.value, row.label)}
                    aria-label={`Copy ${row.label}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "7px 12px",
                      background: copied ? `${color}18` : "var(--surface)",
                      color:      copied ? color : "var(--t3)",
                      border:     `1.5px solid ${copied ? color : "var(--divider)"}`,
                      borderRadius: "var(--r-md)",
                      fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700,
                      cursor: "pointer", flexShrink: 0, minWidth: 72, justifyContent: "center",
                      minHeight: 36, transition: "all 0.2s",
                    }}
                  >
                    {copied ? <><CheckIcon size={11} /> Copied</> : <><CopyIcon size={11} /> Copy</>}
                  </button>
                </div>
              );
            })}
          </div>

          {steps.length > 0 && (
            <>
              <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-2)" }}>
                How to Pay
              </p>
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                {steps.map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: `${color}18`, color, fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>{step}</p>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Screenshot upload (shared logic) ────────────────────────────────────────
function ScreenshotUpload({
  preview, uploading, uploadError,
  onFileChange, onRemove,
}: {
  preview: string | null; uploading: boolean; uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}>
        Payment Screenshot
        <span style={{ fontWeight: 400, color: "var(--t3)", marginLeft: 6, fontSize: "var(--fs-xs)" }}>(recommended)</span>
      </p>

      {preview ? (
        <div style={{ position: "relative" }}>
          <img
            src={preview}
            alt="Payment screenshot"
            style={{
              width:        "100%",
              borderRadius: "var(--r-md)",
              /* Portrait ratio — matches typical mobile banking screenshots (3:4) */
              aspectRatio:  "3 / 4",
              objectFit:    "cover",
              objectPosition: "center top",
              border:       "1px solid var(--divider)",
              display:      "block",
            }}
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove screenshot"
            style={{ position: "absolute", top: 8, right: 8, background: "var(--hero-bg)", color: "#fff", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <XIcon size={13} color="#fff" />
          </button>
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "var(--s-success-bg)", border: "1px solid var(--s-success)", borderRadius: "var(--r-sm)", padding: "3px 8px", display: "flex", alignItems: "center", gap: 4 }}>
            <CheckIcon size={10} color="var(--s-success)" />
            <span style={{ fontSize: 10, color: "var(--s-success)", fontWeight: 700, fontFamily: "var(--font-heading)" }}>Uploaded</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Upload payment screenshot"
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            border: "2px dashed var(--divider)", borderRadius: "var(--r-lg)",
            background: "var(--surface)", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "var(--sp-2)", justifyContent: "center",
          }}
        >
          {uploading
            ? <div className="animate-spin" style={{ width: 26, height: 26, border: "2.5px solid var(--divider)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
            : <>
                <UploadIcon size={26} color="var(--t3)" aria-hidden="true" />
                <p style={{ fontSize: "var(--fs-base)", color: "var(--t2)", fontWeight: 500 }}>Tap to upload receipt</p>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>JPEG, PNG or WebP · Max 10MB</p>
              </>
          }
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} style={{ display: "none" }} aria-hidden="true" />
      {uploadError && <p role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>{uploadError}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function WalletDepositPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, refreshMe } = useAuthStore();

  const suggestedAmount = location.state?.suggestedAmount as number | undefined;
  const returnTo        = location.state?.returnTo        as string | undefined;

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [expandedMethodId, setExpandedMethodId] = useState<string | null>(null);

  // Stable idempotency key — generated once per page mount so retries don't
  // create duplicate payments. Reset to a new UUID after a successful submit.
  const idempotencyKeyRef = useRef<string>(randomUUID());

  // Screenshot state
  const [screenshotKey,     setScreenshotKey]     = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadError,       setUploadError]       = useState<string | null>(null);
  const [uploading,         setUploading]         = useState(false);

  const { data: methods, isLoading, error, refetch } = useQuery({
    queryKey: ["payment-methods"],
    queryFn:  () => api.get<{ success: boolean; data: PaymentMethod[] }>("/payment-methods").then(r => r.data.data),
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    mode:          "onChange",
    defaultValues: {
      amountETB:    suggestedAmount,
      transferDate: new Date().toISOString().slice(0, 10),
    },
  });

  const watchedAmount = watch("amountETB");
  const walletBalance = user?.wallet?.balanceETB ?? 0;

  // Screenshot upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) { setUploadError("File must be under 10MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      const res = await api.post<{ success: boolean; data: { key: string } }>(
        "/payments/upload-proof", formData, { headers: { "Content-Type": "multipart/form-data" } }
      );
      setScreenshotKey(res.data.data.key);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setScreenshotPreview(null);
    } finally { setUploading(false); }
  };

  const depositMutation = useMutation({
    mutationFn: (values: FormValues) => api.post("/payments", {
      orderId:         null,
      paymentMethodId: values.paymentMethodId,
      amountETB:       values.amountETB * 100,
      reference:       values.transferDate,
      screenshotKey:   screenshotKey ?? undefined,
      idempotencyKey:  idempotencyKeyRef.current,
    }),
    onSuccess: async () => {
      hapticSuccess();
      idempotencyKeyRef.current = randomUUID(); // rotate for any future submit
      await refreshMe();
      navigate(returnTo ?? "/wallet", { replace: true });
    },
    onError: () => hapticError(),
  });

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error)     return <div className="page"><ErrorMessage message="Failed to load payment methods" onRetry={() => refetch()} /></div>;

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Deposit Funds" subtitle="Add money to your wallet" showBack />

      {/* Balance hero */}
      <div style={{ background: "var(--hero-bg)", borderRadius: "var(--r-xl)", padding: "var(--sp-5)", marginBottom: "var(--sp-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Current Balance</p>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "#fff" }}>
              {etbDisplay(walletBalance)} ETB
            </p>
          </div>
          {watchedAmount > 0 && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>After Deposit</p>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--cd-gold)" }}>
                {etbDisplay(walletBalance + watchedAmount * 100)} ETB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Return-to info */}
      {returnTo && (
        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", padding: "var(--sp-3) var(--sp-4)", background: "var(--s-info-bg)", border: "1px solid var(--divider)", borderRadius: "var(--r-md)", marginBottom: "var(--sp-5)" }}>
          <InfoIcon size={14} color="var(--s-info)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--s-info)", lineHeight: "var(--lh-normal)" }}>
            After your deposit is approved, you'll be returned to checkout.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(v => depositMutation.mutate(v))} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

        {/* Amount */}
        <div>
          <label htmlFor="deposit-amount" style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}>
            Amount (ETB) <span style={{ color: "var(--accent)" }} aria-hidden="true">*</span>
          </label>
          <input
            id="deposit-amount"
            {...register("amountETB", { valueAsNumber: true })}
            type="number"
            inputMode="numeric"
            placeholder="e.g. 500"
            min={50}
            aria-describedby="amount-hint"
            aria-invalid={!!errors.amountETB}
            style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${errors.amountETB ? "var(--s-error)" : "var(--input-border)"}`, borderRadius: "var(--r-md)", fontSize: "var(--fs-base)", background: "var(--input-bg)", color: "var(--input-text)", outline: "none" }}
          />
          {errors.amountETB
            ? <p id="amount-hint" role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>{errors.amountETB.message}</p>
            : <p id="amount-hint" style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 6 }}>Minimum deposit: 50 ETB</p>
          }
        </div>

        {/* Payment method — expandable brand cards */}
        <div>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-3)" }}>
            Payment Method <span style={{ color: "var(--accent)" }} aria-hidden="true">*</span>
          </p>
          <input type="hidden" {...register("paymentMethodId")} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }} role="radiogroup" aria-label="Choose payment method">
            {methods?.map(m => (
              <MethodCard
                key={m.id}
                method={m}
                isSelected={selectedMethodId === m.id}
                isExpanded={expandedMethodId === m.id}
                onSelect={() => {
                  setSelectedMethodId(m.id);
                  setValue("paymentMethodId", m.id, { shouldValidate: true });
                }}
                onToggle={() => setExpandedMethodId(prev => prev === m.id ? null : m.id)}
              />
            ))}
          </div>
          {errors.paymentMethodId && (
            <p role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 8 }}>{errors.paymentMethodId.message}</p>
          )}
        </div>

        {/* Transfer Date */}
        <div>
          <label htmlFor="deposit-date" style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}>
            Transfer Date <span style={{ color: "var(--accent)" }} aria-hidden="true">*</span>
          </label>
          <input
            id="deposit-date"
            {...register("transferDate")}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            aria-invalid={!!errors.transferDate}
            style={{ width: "100%", padding: "13px 14px", border: `1.5px solid ${errors.transferDate ? "var(--s-error)" : "var(--input-border)"}`, borderRadius: "var(--r-md)", fontSize: "var(--fs-base)", background: "var(--input-bg)", color: "var(--input-text)", outline: "none" }}
          />
          {errors.transferDate
            ? <p role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>{errors.transferDate.message}</p>
            : <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 6 }}>Select the date you made the transfer.</p>
          }
        </div>

        {/* Screenshot upload */}
        <ScreenshotUpload
          preview={screenshotPreview}
          uploading={uploading}
          uploadError={uploadError}
          onFileChange={handleFileChange}
          onRemove={() => { setScreenshotPreview(null); setScreenshotKey(null); }}
        />

        {depositMutation.isError && (
          <div role="alert" style={{ background: "var(--s-error-bg)", border: "1px solid var(--s-error-border)", borderRadius: "var(--r-md)", padding: "12px var(--sp-4)", fontSize: "var(--fs-sm)", color: "var(--s-error)" }}>
            Submission failed. Please try again.
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", padding: "var(--sp-3) var(--sp-4)", background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-md)" }}>
          <InfoIcon size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>
            Deposits are reviewed and credited within 24 hours.
          </p>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={!isValid || uploading} loading={depositMutation.isPending}>
          Submit Deposit Request
        </Button>
      </form>
    </div>
  );
}

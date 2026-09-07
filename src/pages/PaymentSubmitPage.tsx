import { useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, etbDisplay } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { hapticSuccess, hapticError } from "@/lib/telegram";
import { randomUUID } from "./payment-utils";
import { UploadIcon, XIcon, InfoIcon, CheckIcon } from "@/components/ui/Icon";

interface PaymentMethod { id: string; name: string }
const schema = z.object({ transferDate: z.string().min(1, "Transfer date is required") });
type FormValues = z.infer<typeof schema>;

export function PaymentSubmitPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const location    = useLocation();
  const method      = location.state?.method as PaymentMethod | undefined;
  const orderAmount = location.state?.orderAmount as number | undefined;

  const [screenshotKey,     setScreenshotKey]     = useState<string | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadError,       setUploadError]       = useState<string | null>(null);
  const [uploading,         setUploading]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { transferDate: new Date().toISOString().slice(0, 10) },
  });

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
      const res = await api.post<{ success: boolean; data: { key: string; signedUrl: string } }>(
        "/payments/upload-proof", formData, { headers: { "Content-Type": "multipart/form-data" } }
      );
      setScreenshotKey(res.data.data.key);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setScreenshotPreview(null);
    } finally { setUploading(false); }
  };

  const submitMutation = useMutation({
    mutationFn: (values: FormValues) => api.post("/payments", {
      orderId,
      paymentMethodId: method?.id,
      amountETB: orderAmount ?? 0,
      reference: values.transferDate,   // stored as reference field in DB
      screenshotKey: screenshotKey ?? undefined,
      idempotencyKey: randomUUID(),
    }),
    onSuccess: () => { hapticSuccess(); navigate(`/orders/${orderId}`, { replace: true }); },
    onError:   () => hapticError(),
  });

  if (!method) { navigate(`/payment/${orderId}/method`, { replace: true }); return null; }

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Submit Proof" subtitle={method.name} showBack />

      {/* Amount */}
      {orderAmount != null && (
        <div style={{
          background:    "var(--hero-bg)",
          borderRadius:  "var(--r-xl)",
          padding:       "var(--sp-4) var(--sp-5)",
          marginBottom:  "var(--sp-5)",
          display:       "flex",
          justifyContent:"space-between",
          alignItems:    "center",
        }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.65)" }}>Amount transferred</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--cd-gold)" }}>
            {etbDisplay(orderAmount)} ETB
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(v => submitMutation.mutate(v))} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

        {/* Transfer Date */}
        <div>
          <label htmlFor="payment-date" style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}>
            Transfer Date <span style={{ color: "var(--accent)" }} aria-hidden="true">*</span>
          </label>
          <input
            id="payment-date"
            {...register("transferDate")}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            aria-describedby="date-hint"
            aria-invalid={!!errors.transferDate}
            style={{
              width:        "100%",
              padding:      "13px 14px",
              border:       `1.5px solid ${errors.transferDate ? "var(--s-error)" : "var(--input-border)"}`,
              borderRadius: "var(--r-md)",
              fontSize:     "var(--fs-base)",
              background:   "var(--input-bg)",
              color:        "var(--input-text)",
              outline:      "none",
            }}
          />
          {errors.transferDate
            ? <p id="date-hint" role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>{errors.transferDate.message}</p>
            : <p id="date-hint" style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 6 }}>Select the date you made the transfer.</p>
          }
        </div>

        {/* Screenshot */}
        <div>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}>
            Payment Screenshot
            <span style={{ color: "var(--t3)", fontWeight: 400, marginLeft: 6, fontSize: "var(--fs-xs)" }}>(recommended)</span>
          </p>

          {screenshotPreview ? (
            <div style={{ position: "relative" }}>
              <img
                src={screenshotPreview}
                alt="Payment proof preview"
                style={{
                  width:          "100%",
                  borderRadius:   "var(--r-md)",
                  aspectRatio:    "3 / 4",
                  objectFit:      "cover",
                  objectPosition: "center top",
                  border:         "1px solid var(--divider)",
                  display:        "block",
                }}
              />
              <button
                type="button"
                onClick={() => { setScreenshotPreview(null); setScreenshotKey(null); }}
                aria-label="Remove screenshot"
                style={{
                  position:       "absolute",
                  top:            8,
                  right:          8,
                  background:     "var(--hero-bg)",
                  color:          "#fff",
                  border:         "none",
                  borderRadius:   "50%",
                  width:          36,
                  height:         36,
                  cursor:         "pointer",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                }}
              >
                <XIcon size={14} color="#fff" />
              </button>
              {/* Uploaded indicator */}
              <div style={{ position: "absolute", bottom: 8, left: 8, background: "var(--s-success-bg)", border: "1px solid var(--s-success)", borderRadius: "var(--r-sm)", padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                <CheckIcon size={11} color="var(--s-success)" />
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--s-success)", fontWeight: 700 }}>Uploaded</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Upload payment screenshot"
              style={{
                width:          "100%",
                aspectRatio:    "3 / 4",
                border:         "2px dashed var(--divider)",
                borderRadius:   "var(--r-lg)",
                background:     "var(--surface)",
                cursor:         "pointer",
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                gap:            "var(--sp-2)",
                justifyContent: "center",
              }}
            >
              {uploading
                ? <div className="animate-spin" style={{ width: 28, height: 28, border: "2.5px solid var(--divider)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
                : <>
                    <UploadIcon size={28} color="var(--t3)" aria-hidden="true" />
                    <p style={{ fontSize: "var(--fs-base)", color: "var(--t2)", fontWeight: 500 }}>Tap to upload</p>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>JPEG, PNG, or WebP · Max 10MB</p>
                  </>
              }
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: "none" }} aria-hidden="true" />
          {uploadError && <p role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>{uploadError}</p>}
        </div>

        {/* Info note */}
        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", padding: "var(--sp-3) var(--sp-4)", background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-md)" }}>
          <InfoIcon size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>
            Our team will verify your payment within 24 hours and notify you via Telegram.
          </p>
        </div>

        {submitMutation.isError && (
          <div role="alert" style={{ background: "var(--s-error-bg)", border: "1px solid var(--s-error-border)", borderRadius: "var(--r-md)", padding: "12px var(--sp-4)", fontSize: "var(--fs-sm)", color: "var(--s-error)" }}>
            Submission failed. Check your reference number and try again.
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitMutation.isPending || uploading}
          disabled={!isValid}
        >
          Submit Payment
        </Button>
      </form>
    </div>
  );
}

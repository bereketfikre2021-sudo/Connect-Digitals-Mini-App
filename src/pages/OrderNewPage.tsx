import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrderStore } from "@/store/order.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { LinkIcon, InfoIcon, ArrowRightIcon } from "@/components/ui/Icon";

// Target guidance by service type
const TARGET_GUIDANCE: Record<string, { intro: string; example: string; steps: string[] }> = {
  PROFILE:  { intro: "Enter your profile URL — the main page of your account.", example: "https://www.tiktok.com/@yourusername", steps: ["Open the app", "Go to your profile", "Copy the URL from your browser"] },
  PAGE:     { intro: "Enter your page URL.", example: "https://www.facebook.com/YourPageName", steps: ["Go to your page", "Copy the URL from the address bar"] },
  POST:     { intro: "Enter the URL of the specific post you want to promote.", example: "https://www.instagram.com/p/XXXXXXXXX/", steps: ["Open the post", "Tap ···  → Copy Link", "Paste it here"] },
  VIDEO:    { intro: "Enter the URL of the video you want to promote.", example: "https://www.youtube.com/watch?v=XXXXXXXXX", steps: ["Open the video", "Copy the URL from the address bar or Share menu"] },
  CHANNEL:  { intro: "Enter your Telegram channel link.", example: "https://t.me/yourchannel", steps: ["Open your channel", "Use Invite Link or copy the URL"] },
  WEBSITE:  { intro: "Enter the full URL of your website.", example: "https://yourwebsite.com", steps: ["Copy your website URL from the browser address bar"] },
  CUSTOM:   { intro: "Enter the URL for this promotion.", example: "https://example.com", steps: ["Copy the relevant URL and paste it here"] },
};

type FormValues = { targetUrl: string; notes: string };

export function OrderNewPage() {
  const navigate = useNavigate();
  const { service, selectedPackage, setTargetUrl, setNotes } = useOrderStore();

  useEffect(() => {
    if (!service || !selectedPackage) navigate("/services", { replace: true });
  }, [service, selectedPackage, navigate]);

  const schema = z.object({
    targetUrl: service?.requiresTargetUrl
      ? z.string().min(1, "URL is required").url("Enter a valid URL starting with https://")
      : z.string().optional(),
    notes: z.string().max(500).optional(),
  });

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { targetUrl: "", notes: "" },
  });

  const notesValue = watch("notes") ?? "";
  const guidance = service ? (TARGET_GUIDANCE[service.targetType] ?? TARGET_GUIDANCE["CUSTOM"]) : null;

  const onSubmit = (data: FormValues) => {
    setTargetUrl(data.targetUrl ?? "");
    setNotes(data.notes ?? "");
    navigate("/order/review");
  };

  if (!service || !selectedPackage) return null;

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Order Details" subtitle={service.name} showBack />

      {/* Selected package summary */}
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
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Selected Package</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>{selectedPackage.name}</p>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", marginTop: 2 }}>{selectedPackage.quantity.toLocaleString()} units · {selectedPackage.deliveryDaysMin}–{selectedPackage.deliveryDaysMax} days</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--price)" }}>
            {(selectedPackage.priceETB / 100).toFixed(2)}
          </p>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 1 }}>ETB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>

        {/* Target URL */}
        {service.requiresTargetUrl && (
          <div>
            <label
              htmlFor="target-url"
              style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}
            >
              {service.targetLabel}
              <span style={{ color: "var(--accent)", marginLeft: 4 }} aria-hidden="true">*</span>
            </label>

            {/* Guidance card */}
            {guidance && (
              <div style={{
                background:    "var(--surface-sunken)",
                borderRadius:  "var(--r-md)",
                padding:       "var(--sp-3) var(--sp-4)",
                marginBottom:  "var(--sp-3)",
                border:        "1px solid var(--divider)",
              }}>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", marginBottom: "var(--sp-2)", lineHeight: "var(--lh-normal)" }}>
                  {guidance.intro}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)", marginBottom: "var(--sp-2)" }}>
                  {guidance.steps.map((step, i) => (
                    <p key={i} style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", display: "flex", gap: 6 }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      {step}
                    </p>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: "var(--surface)", borderRadius: "var(--r-sm)", padding: "6px 10px" }}>
                  <LinkIcon size={12} color="var(--t3)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                    {guidance.example}
                  </p>
                </div>
              </div>
            )}

            {/* URL input */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <LinkIcon size={15} color={errors.targetUrl ? "var(--s-error)" : "var(--t3)"} aria-hidden="true" />
              </div>
              <input
                id="target-url"
                {...register("targetUrl")}
                type="url"
                inputMode="url"
                placeholder={service.targetPlaceholder}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby={errors.targetUrl ? "target-url-error" : undefined}
                aria-invalid={!!errors.targetUrl}
                style={{
                  width:        "100%",
                  paddingLeft:  42,
                  paddingRight: 14,
                  paddingTop:   13,
                  paddingBottom:13,
                  border:       `1.5px solid ${errors.targetUrl ? "var(--s-error)" : "var(--input-border)"}`,
                  borderRadius: "var(--r-md)",
                  fontSize:     "var(--fs-sm)",
                  background:   "var(--input-bg)",
                  color:        "var(--input-text)",
                  outline:      "none",
                  fontFamily:   "var(--font-mono)",
                }}
              />
            </div>

            {errors.targetUrl ? (
              <p id="target-url-error" role="alert" style={{ fontSize: "var(--fs-xs)", color: "var(--s-error)", marginTop: 6 }}>
                {errors.targetUrl.message}
              </p>
            ) : (
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 6 }}>
                Must be a full URL starting with https://
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label
            htmlFor="order-notes"
            style={{ display: "block", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--t1)", marginBottom: "var(--sp-2)" }}
          >
            Additional Notes
            <span style={{ fontWeight: 400, color: "var(--t3)", marginLeft: 6, fontSize: "var(--fs-xs)" }}>(optional)</span>
          </label>
          <textarea
            id="order-notes"
            {...register("notes")}
            placeholder="Any special instructions for your promotion…"
            className="textarea-autogrow"
            maxLength={500}
            style={{
              width:        "100%",
              padding:      "12px 14px",
              border:       "1.5px solid var(--input-border)",
              borderRadius: "var(--r-md)",
              fontSize:     "var(--fs-sm)",
              background:   "var(--input-bg)",
              color:        "var(--input-text)",
              outline:      "none",
              lineHeight:   "var(--lh-normal)",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <span style={{
              fontSize:  "var(--fs-xs)",
              color:     notesValue.length > 450 ? "var(--s-warning)" : "var(--t3)",
              fontWeight: notesValue.length > 450 ? 600 : 400,
            }}>
              {notesValue.length}/500
            </span>
          </div>
        </div>

        {/* Note about next step */}
        <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "flex-start", padding: "var(--sp-3) var(--sp-4)", background: "var(--accent-dim)", borderRadius: "var(--r-md)", border: "1px solid rgba(236,28,36,0.12)" }}>
          <InfoIcon size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>
            You'll review your order on the next step before it's placed.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          iconRight={<ArrowRightIcon size={16} color="#fff" />}
        >
          Continue to Review
        </Button>
      </form>
    </div>
  );
}

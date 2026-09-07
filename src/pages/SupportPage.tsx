import { PageHeader } from "@/components/layout/PageHeader";
import { MessageIcon, MailIcon, HelpCircleIcon, ChevronRightIcon } from "@/components/ui/Icon";
import { WebApp } from "@/lib/telegram";

const FAQ = [
  { q: "How long does payment verification take?",  a: "Payments are usually verified within 24 hours. You'll receive a Telegram notification once confirmed." },
  { q: "My payment was rejected — what do I do?",   a: "Check that your reference number matches your receipt exactly and that you've transferred the correct amount. Then re-submit from the order detail page." },
  { q: "When will my order be fulfilled?",          a: "After payment is approved, fulfillment begins immediately. Most orders complete within the delivery window shown on the package." },
  { q: "Can I cancel my order?",                    a: "Orders can only be cancelled before payment is made. Once payment is submitted, cancellation is no longer available." },
  { q: "How do I top up my wallet?",                a: "Go to Wallet → Deposit Funds. Select a payment method, enter the amount, transfer it, and submit your reference number." },
  { q: "I have a different question",               a: "Contact us via Telegram or email using the details below. Include your order number for faster support." },
];

function openSupport() {
  try {
    WebApp.openTelegramLink("https://t.me/ConnectDigitalsSupport");
  } catch {
    window.open("https://t.me/ConnectDigitalsSupport", "_blank");
  }
}

export function SupportPage() {
  return (
    <div className="page animate-fade-in">
      <PageHeader title="Support" />

      {/* CTA banner */}
      <div style={{
        background:   "var(--hero-bg)",
        borderRadius: "var(--r-xl)",
        padding:      "var(--sp-6) var(--sp-5)",
        marginBottom: "var(--sp-5)",
        textAlign:    "center",
      }}>
        <div style={{ width: 52, height: 52, borderRadius: "var(--r-lg)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-4)" }}>
          <MessageIcon size={24} color="#fff" aria-hidden="true" />
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "#fff", marginBottom: 8, lineHeight: "var(--lh-snug)" }}>
          Need Help?
        </h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.70)", marginBottom: "var(--sp-5)", lineHeight: "var(--lh-normal)" }}>
          Our team typically responds within 24 hours. Include your order number for faster assistance.
        </p>
        <button
          onClick={openSupport}
          style={{
            background:   "var(--cd-gold)",
            color:        "var(--cd-navy)",
            border:       "none",
            borderRadius: "var(--r-md)",
            padding:      "10px 22px",
            fontFamily:   "var(--font-heading)",
            fontWeight:   700,
            fontSize:     "var(--fs-sm)",
            cursor:       "pointer",
            minHeight:    44,
          }}
        >
          Contact via Telegram
        </button>
      </div>

      {/* Contact info */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-5)" }}>
        {[
          { Icon: MessageIcon, label: "Telegram", value: "@ConnectDigitalsSupport" },
          { Icon: MailIcon,    label: "Email",    value: "support@connectdigitals.com" },
          { Icon: HelpCircleIcon, label: "Response time", value: "Within 24 hours" },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", padding: "14px var(--sp-4)", borderBottom: "1px solid var(--divider)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--r-sm)", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <row.Icon size={16} color="var(--accent)" aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 2 }}>{row.label}</p>
              <p style={{ fontSize: "var(--fs-base)", fontWeight: 500, color: "var(--t1)" }}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
        Frequently Asked
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
        {FAQ.map(item => (
          <details
            key={item.q}
            style={{
              background:   "var(--surface)",
              border:       "1px solid var(--divider)",
              borderRadius: "var(--r-lg)",
              overflow:     "hidden",
            }}
          >
            <summary style={{
              padding:      "14px var(--sp-4)",
              cursor:       "pointer",
              listStyle:    "none",
              display:      "flex",
              justifyContent:"space-between",
              alignItems:   "center",
              gap:          "var(--sp-3)",
              fontFamily:   "var(--font-heading)",
              fontWeight:   600,
              fontSize:     "var(--fs-base)",
              color:        "var(--t1)",
              userSelect:   "none",
              minHeight:    52,
            }}>
              <span>{item.q}</span>
              <ChevronRightIcon size={16} color="var(--t3)" style={{ flexShrink: 0, transition: "transform 0.2s" }} aria-hidden="true" />
            </summary>
            <div style={{ padding: "0 var(--sp-4) var(--sp-4)", borderTop: "1px solid var(--divider)" }}>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)", paddingTop: "var(--sp-3)" }}>
                {item.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

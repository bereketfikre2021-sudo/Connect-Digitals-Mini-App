import { PageHeader } from "@/components/layout/PageHeader";
import { BellIcon, CreditCardIcon, CheckIcon, XIcon, ZapIcon, BarChartIcon, ClipboardIcon } from "@/components/ui/Icon";

const EVENTS = [
  { Icon: ClipboardIcon, event: "Order Placed",      desc: "When you place a new order" },
  { Icon: CreditCardIcon,event: "Payment Submitted", desc: "When your payment proof is received" },
  { Icon: CheckIcon,     event: "Payment Approved",  desc: "When admin confirms your payment" },
  { Icon: XIcon,         event: "Payment Rejected",  desc: "If there's an issue with your payment" },
  { Icon: ZapIcon,       event: "Fulfillment Started",desc: "When work begins on your order" },
  { Icon: CheckIcon,     event: "Order Completed",   desc: "When your promotion is delivered" },
  { Icon: BarChartIcon,  event: "Report Available",  desc: "When your campaign report is ready" },
];

export function NotificationsPage() {
  return (
    <div className="page animate-fade-in">
      <PageHeader title="Notifications" />

      {/* Hero */}
      <div style={{ background: "var(--hero-bg)", borderRadius: "var(--r-xl)", padding: "var(--sp-5)", marginBottom: "var(--sp-5)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--sp-3)" }}>
          <BellIcon size={24} color="#fff" aria-hidden="true" />
        </div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-lg)", fontWeight: 700, color: "#fff", marginBottom: 6 }}>
          Telegram Notifications
        </h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.70)", lineHeight: "var(--lh-normal)" }}>
          All notifications are sent directly via the Connect Digitals Telegram Bot. Make sure you haven't muted the bot.
        </p>
      </div>

      {/* Events */}
      <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-3)" }}>
        You'll be notified for
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)", marginBottom: "var(--sp-5)" }}>
        {EVENTS.map(n => (
          <div
            key={n.event}
            style={{
              background:   "var(--surface)",
              border:       "1px solid var(--divider)",
              borderRadius: "var(--r-lg)",
              padding:      "var(--sp-4)",
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--sp-4)",
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <n.Icon size={18} color="var(--accent)" aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)", marginBottom: 2 }}>{n.event}</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{n.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "var(--sp-4)", background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-md)", fontSize: "var(--fs-sm)", color: "var(--t3)", lineHeight: "var(--lh-normal)" }}>
        In-app notification history will be available soon. Check your Telegram chat with the bot for all updates.
      </div>
    </div>
  );
}

/**
 * StatusBadge — small inline status pill.
 * Uses semantic CSS variable tokens only.
 */

interface BadgeConfig { label: string; bg: string; color: string }

const CFG: Record<string, BadgeConfig> = {
  PENDING_PAYMENT:   { label: "Awaiting Payment",  bg: "var(--s-warning-bg)", color: "var(--s-warning)" },
  PAYMENT_SUBMITTED: { label: "Under Review",       bg: "var(--s-info-bg)",    color: "var(--s-info)" },
  PAYMENT_APPROVED:  { label: "Payment Approved",   bg: "var(--s-success-bg)", color: "var(--s-success)" },
  PAYMENT_REJECTED:  { label: "Payment Rejected",   bg: "var(--s-error-bg)",   color: "var(--s-error)" },
  PROCESSING:        { label: "Processing",          bg: "var(--s-purple-bg)",  color: "var(--s-purple)" },
  IN_PROGRESS:       { label: "In Progress",         bg: "var(--s-info-bg)",    color: "var(--s-info)" },
  COMPLETED:         { label: "Completed",           bg: "var(--s-success-bg)", color: "var(--s-success)" },
  CANCELLED:         { label: "Cancelled",           bg: "var(--s-neutral-bg)", color: "var(--s-neutral)" },
  REFUNDED:          { label: "Refunded",            bg: "var(--s-neutral-bg)", color: "var(--s-neutral)" },
  PENDING:           { label: "Pending",             bg: "var(--s-warning-bg)", color: "var(--s-warning)" },
  UNDER_REVIEW:      { label: "Under Review",        bg: "var(--s-info-bg)",    color: "var(--s-info)" },
  APPROVED:          { label: "Approved",            bg: "var(--s-success-bg)", color: "var(--s-success)" },
  REJECTED:          { label: "Rejected",            bg: "var(--s-error-bg)",   color: "var(--s-error)" },
  DEPOSIT:           { label: "Deposit",             bg: "var(--s-success-bg)", color: "var(--s-success)" },
  ORDER_PAYMENT:     { label: "Order Payment",       bg: "var(--s-error-bg)",   color: "var(--s-error)" },
  REFUND:            { label: "Refund",              bg: "var(--s-info-bg)",    color: "var(--s-info)" },
  ADJUSTMENT:        { label: "Adjustment",          bg: "var(--s-neutral-bg)", color: "var(--s-neutral)" },
  REWARD:            { label: "Reward",              bg: "var(--s-purple-bg)",  color: "var(--s-purple)" },
};

const FALLBACK: BadgeConfig = { label: "", bg: "var(--s-neutral-bg)", color: "var(--s-neutral)" };

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = CFG[status] ?? { ...FALLBACK, label: status.replace(/_/g, " ") };
  return (
    <span
      className={className}
      style={{
        display:       "inline-flex",
        alignItems:    "center",
        padding:       "3px 9px",
        borderRadius:  "var(--r-full)",
        fontSize:      "var(--fs-xs)",
        fontWeight:    700,
        letterSpacing: 0.2,
        background:    cfg.bg,
        color:         cfg.color,
        whiteSpace:    "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

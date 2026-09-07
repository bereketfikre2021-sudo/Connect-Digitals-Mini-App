import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, timeAgo } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  BellIcon, CreditCardIcon, CheckIcon, XIcon, ZapIcon,
  BarChartIcon, ClipboardIcon, CoinsIcon, WalletIcon,
} from "@/components/ui/Icon";

interface Notification {
  id: string; event: string; title: string; message: string;
  readAt: string | null; createdAt: string;
}
interface NotifData { notifications: Notification[]; total: number; unreadCount: number }

const EVENT_ICONS: Record<string, typeof BellIcon> = {
  ORDER_CREATED:       ClipboardIcon,
  PAYMENT_SUBMITTED:   CreditCardIcon,
  PAYMENT_APPROVED:    CheckIcon,
  PAYMENT_REJECTED:    XIcon,
  ORDER_PROCESSING:    ZapIcon,
  FULFILLMENT_STARTED: ZapIcon,
  ORDER_COMPLETED:     CheckIcon,
  ORDER_CANCELLED:     XIcon,
  REFUND_ISSUED:       CoinsIcon,
  REPORT_AVAILABLE:    BarChartIcon,
  WALLET_CREDITED:     WalletIcon,
};

const EVENT_COLORS: Record<string, string> = {
  PAYMENT_APPROVED:  "var(--s-success)",
  ORDER_COMPLETED:   "var(--s-success)",
  WALLET_CREDITED:   "var(--s-success)",
  PAYMENT_REJECTED:  "var(--s-error)",
  ORDER_CANCELLED:   "var(--s-error)",
  REPORT_AVAILABLE:  "var(--s-info)",
  REFUND_ISSUED:     "var(--s-warning)",
};

export function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<{ success: boolean; data: NotifData }>("/notifications").then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneRead = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div className="page animate-fade-in">
      <PageHeader
        title="Notifications"
        right={
          data?.unreadCount && data.unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}
            >
              Mark all read
            </button>
          ) : undefined
        }
      />

      {/* Unread count badge */}
      {data && data.unreadCount > 0 && (
        <div style={{ marginBottom: "var(--sp-4)", padding: "var(--sp-3) var(--sp-4)", background: "var(--accent-dim)", border: "1px solid rgba(236,28,36,0.15)", borderRadius: "var(--r-md)" }}>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--accent)", fontWeight: 700 }}>
            {data.unreadCount} unread notification{data.unreadCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {isLoading && <Spinner />}
      {error && <ErrorMessage message="Failed to load notifications" onRetry={() => refetch()} />}

      {data?.notifications.length === 0 && !isLoading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--sp-12) var(--sp-4)", gap: "var(--sp-3)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BellIcon size={24} color="var(--t3)" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>No notifications yet.</p>
          <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>You'll be notified here and via Telegram for all order updates.</p>
        </div>
      )}

      {data && data.notifications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
          {data.notifications.map(n => {
            const Icon  = EVENT_ICONS[n.event] ?? BellIcon;
            const color = EVENT_COLORS[n.event] ?? "var(--t3)";
            const unread = n.readAt === null;

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => { if (unread) markOneRead.mutate(n.id); }}
                aria-label={unread ? `Mark "${n.title}" as read` : n.title}
                style={{
                  width: "100%",
                  background:   unread ? "var(--accent-dim)" : "var(--surface)",
                  border:       `1px solid ${unread ? "rgba(236,28,36,0.18)" : "var(--divider)"}`,
                  borderRadius: "var(--r-lg)",
                  padding:      "var(--sp-4)",
                  textAlign:    "left",
                  cursor:       unread ? "pointer" : "default",
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "var(--sp-3)",
                }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--surface)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={color} aria-hidden="true" />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sp-2)", marginBottom: 3 }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--t1)", lineHeight: "var(--lh-tight)" }}>
                      {n.title}
                    </p>
                    <span style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", flexShrink: 0, marginTop: 1 }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t2)", lineHeight: "var(--lh-normal)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as never }}>
                    {n.message}
                  </p>
                </div>

                {/* Unread dot */}
                {unread && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

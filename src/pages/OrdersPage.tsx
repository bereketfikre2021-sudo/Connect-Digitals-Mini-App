import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay, formatDate } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/Button";
import { ChevronRightIcon, GridIcon, PLATFORM_BRAND_ICONS } from "@/components/ui/Icon";

interface OrderSummary {
  id: string; orderNumber: string; targetUrl: string;
  totalAmountETB: number; orderStatus: string; paymentStatus: string;
  fulfillmentStatus: string; createdAt: string;
  service: { name: string; slug: string; platform: { name: string; slug: string; iconUrl: string | null } };
  package: { name: string; quantity: number };
}

const STATUS_HINTS: Record<string, string> = {
  PENDING_PAYMENT:   "Complete payment to begin",
  PAYMENT_SUBMITTED: "Payment is being reviewed",
  PAYMENT_REJECTED:  "Please re-submit payment",
  PROCESSING:        "Setting up your promotion",
  IN_PROGRESS:       "Promotion is running",
};

export function OrdersPage() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<{ success: boolean; data: { orders: OrderSummary[] } }>("/orders").then(r => r.data.data),
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error) return <div className="page"><ErrorMessage message="Failed to load orders" onRetry={() => refetch()} /></div>;

  const orders = data?.orders ?? [];

  return (
    <div className="page animate-fade-in">
      <PageHeader title="My Orders" />

      {orders.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "var(--sp-12)", gap: "var(--sp-4)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GridIcon size={28} color="var(--t3)" aria-hidden="true" />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--t1)", marginBottom: 6 }}>No orders yet</p>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", lineHeight: "var(--lh-normal)", maxWidth: 240 }}>
              Browse our services and place your first promotion order.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => navigate("/services")}>
            Browse Services
          </Button>
        </div>
      ) : (
        <div role="list" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
          {orders.map(order => {
            const BrandIcon = PLATFORM_BRAND_ICONS[order.service.platform?.slug ?? ""];
            const hint = STATUS_HINTS[order.orderStatus];
            const isActionable = ["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.orderStatus);

            return (
              <button
                key={order.id}
                role="listitem"
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{
                  background:    "var(--surface)",
                  border:        `1.5px solid ${isActionable ? "var(--accent)" : "var(--divider)"}`,
                  borderRadius:  "var(--r-lg)",
                  padding:       "var(--sp-4)",
                  textAlign:     "left",
                  cursor:        "pointer",
                  display:       "flex",
                  gap:           "var(--sp-3)",
                  alignItems:    "flex-start",
                }}
              >
                {/* Platform icon */}
                <div style={{
                  width:          44,
                  height:         44,
                  borderRadius:   "var(--r-md)",
                  background:     "var(--icon-gold-bg)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                  marginTop:      2,
                }}>
                  {BrandIcon ? <BrandIcon size={26} /> : <GridIcon size={22} color="var(--icon-on-gold)" />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top row: service + price */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)", lineHeight: "var(--lh-tight)" }}>
                      {order.service.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--price)", flexShrink: 0, marginLeft: "var(--sp-2)" }}>
                      {etbDisplay(order.totalAmountETB)} ETB
                    </p>
                  </div>

                  {/* Package + order number */}
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 8 }}>
                    {order.package.name} · {order.orderNumber}
                  </p>

                  {/* Status + date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <StatusBadge status={order.orderStatus} />
                    <span style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>{formatDate(order.createdAt)}</span>
                  </div>

                  {/* Action hint */}
                  {hint && (
                    <p style={{ fontSize: "var(--fs-xs)", color: isActionable ? "var(--accent)" : "var(--t3)", marginTop: 6, fontWeight: isActionable ? 600 : 400 }}>
                      {hint}
                    </p>
                  )}
                </div>

                <ChevronRightIcon size={16} color="var(--t3)" style={{ flexShrink: 0, marginTop: 4 }} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

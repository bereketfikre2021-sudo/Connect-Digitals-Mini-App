import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ClipboardIcon, WalletIcon, BellIcon, HelpCircleIcon, StarIcon, CheckIcon, ChevronRightIcon } from "@/components/ui/Icon";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["profile-stats"],
    queryFn:  async () => {
      const res = await api.get<{ success: boolean; data: { total: number } }>("/orders?pageSize=1");
      return { totalOrders: res.data.data.total, completedOrders: 0 } as { totalOrders: number; completedOrders: number };
    },
  });

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initial  = (user?.firstName?.[0] ?? "?").toUpperCase();

  const links = [
    { Icon: ClipboardIcon, label: "My Orders",     sub: "Track your promotions", to: "/orders" },
    { Icon: WalletIcon,    label: "Wallet",         sub: "Balance & transactions", to: "/wallet" },
    { Icon: BellIcon,      label: "Notifications",  sub: "How you'll be updated", to: "/notifications" },
    { Icon: HelpCircleIcon,label: "Support",        sub: "Get help", to: "/support" },
  ];

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Profile" />

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
        <div style={{
          width:          64,
          height:         64,
          borderRadius:   "50%",
          background:     "var(--hero-bg)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "#fff" }}>{initial}</span>
        </div>
        <div>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "var(--t1)", marginBottom: 2 }}>{fullName}</p>
          {user?.username && <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>@{user.username}</p>}
          {user?.telegramIdentity?.isPremium && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, padding: "2px 8px", background: "var(--icon-gold-bg)", borderRadius: "var(--r-full)" }}>
              <StarIcon size={11} color="var(--icon-on-gold)" aria-hidden="true" />
              <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--icon-on-gold)" }}>Telegram Premium</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {isLoading ? <Spinner /> : stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
          {[
            { label: "Total Orders",    value: stats.totalOrders,    Icon: ClipboardIcon },
            { label: "Completed",       value: stats.completedOrders,Icon: CheckIcon },
          ].map(s => (
            <div
              key={s.label}
              style={{
                background:    "var(--surface)",
                border:        "1px solid var(--divider)",
                borderRadius:  "var(--r-lg)",
                padding:       "var(--sp-4)",
                textAlign:     "center",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--icon-holder-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-2)" }}>
                <s.Icon size={20} color="var(--icon-holder-color)" aria-hidden="true" />
              </div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--t1)" }}>{s.value}</p>
              <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nav links */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
        {links.map(item => (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            style={{
              background:   "var(--surface)",
              border:       "1px solid var(--divider)",
              borderRadius: "var(--r-lg)",
              padding:      "var(--sp-4)",
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--sp-4)",
              cursor:       "pointer",
              textAlign:    "left",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--icon-holder-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <item.Icon size={20} color="var(--icon-holder-color)" aria-hidden="true" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)", marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{item.sub}</p>
            </div>
            <ChevronRightIcon size={16} color="var(--t3)" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Version */}
      <p style={{ textAlign: "center", fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: "var(--sp-8)" }}>
        Connect Digitals v1.0
      </p>
    </div>
  );
}

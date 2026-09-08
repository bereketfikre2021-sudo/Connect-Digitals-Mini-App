import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HomeIcon, GridIcon, ClipboardIcon, WalletIcon, UserIcon, BellIcon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const NAV = [
  { to: "/",              Icon: HomeIcon,      label: "Home" },
  { to: "/services",      Icon: GridIcon,      label: "Services" },
  { to: "/orders",        Icon: ClipboardIcon, label: "Orders" },
  { to: "/wallet",        Icon: WalletIcon,    label: "Wallet" },
  { to: "/notifications", Icon: BellIcon,      label: "Alerts",  bell: true },
  { to: "/profile",       Icon: UserIcon,      label: "Profile" },
];

export function BottomNav() {
  const { isAuthenticated } = useAuthStore();

  // Poll unread count every 30 s — only when logged in
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () =>
      api.get<{ success: boolean; data: { unreadCount: number } }>("/notifications?pageSize=1")
        .then(r => r.data.data.unreadCount),
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  });

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position:    "fixed",
        top:         0,
        left:        0,
        right:       0,
        zIndex:      100,
        background:           "rgba(var(--glass-base), 0.72)",
        backdropFilter:       "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom:         "1px solid rgba(var(--glass-border), 0.18)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div style={{ position: "absolute", top: "env(safe-area-inset-top)", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.20)", pointerEvents: "none" }} />

      <div className="bottom-nav-inner">
        {NAV.map(({ to, Icon, label, bell }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            aria-label={label}
            style={{ flex: 1, display: "flex", textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, position: "relative", minHeight: 44 }}>
                {/* Active pill */}
                {isActive && (
                  <div style={{ position: "absolute", inset: "6px 8px", background: "rgba(var(--glass-active), 0.14)", borderRadius: "var(--r-md)", pointerEvents: "none" }} />
                )}
                {/* Active dot */}
                {isActive && (
                  <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--nav-active)" }} />
                )}

                {/* Icon + badge wrapper */}
                <div style={{ position: "relative" }}>
                  <Icon size={21} color={isActive ? "var(--nav-active)" : "var(--nav-muted)"} aria-hidden="true" />
                  {/* Unread badge — only on bell tab */}
                  {bell && unreadCount > 0 && (
                    <div style={{
                      position:       "absolute",
                      top:            -5,
                      right:          -7,
                      minWidth:       16,
                      height:         16,
                      borderRadius:   8,
                      background:     "#EC1C24",
                      color:          "#fff",
                      fontSize:       9,
                      fontWeight:     800,
                      fontFamily:     "var(--font-heading)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      padding:        "0 4px",
                      lineHeight:     1,
                      border:         "1.5px solid var(--bg)",
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--nav-active)" : "var(--nav-muted)", letterSpacing: 0.2, lineHeight: 1, fontFamily: "var(--font-heading)" }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

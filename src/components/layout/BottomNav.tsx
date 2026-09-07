import { NavLink } from "react-router-dom";
import { HomeIcon, GridIcon, ClipboardIcon, WalletIcon, UserIcon } from "@/components/ui/Icon";

const NAV = [
  { to: "/",         Icon: HomeIcon,      label: "Home" },
  { to: "/services", Icon: GridIcon,      label: "Services" },
  { to: "/orders",   Icon: ClipboardIcon, label: "Orders" },
  { to: "/wallet",   Icon: WalletIcon,    label: "Wallet" },
  { to: "/profile",  Icon: UserIcon,      label: "Profile" },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        /* ── Position: fixed TOP ── */
        position:    "fixed",
        top:         0,
        left:        0,
        right:       0,
        zIndex:      100,

        /* ── Glassmorphism ── */
        background:           "rgba(var(--glass-base), 0.72)",
        backdropFilter:       "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom:         "1px solid rgba(var(--glass-border), 0.18)",

        /* Safe area for notch phones */
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Subtle inner highlight line — classic glassmorphism touch */}
      <div style={{
        position:   "absolute",
        top:        "env(safe-area-inset-top)",
        left:       0,
        right:      0,
        height:     1,
        background: "rgba(255,255,255,0.20)",
        pointerEvents: "none",
      }} />

      <div className="bottom-nav-inner">
        {NAV.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            aria-label={label}
            style={{ flex: 1, display: "flex", textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  flex:           1,
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            3,
                  position:       "relative",
                  minHeight:      44,
                }}
              >
                {/* Active pill background */}
                {isActive && (
                  <div style={{
                    position:     "absolute",
                    inset:        "6px 12px",
                    background:   "rgba(var(--glass-active), 0.14)",
                    borderRadius: "var(--r-md)",
                    pointerEvents:"none",
                  }} />
                )}

                {/* Active dot indicator — below icon */}
                {isActive && (
                  <div style={{
                    position:     "absolute",
                    bottom:       6,
                    left:         "50%",
                    transform:    "translateX(-50%)",
                    width:        4,
                    height:       4,
                    borderRadius: "50%",
                    background:   "var(--nav-active)",
                  }} />
                )}

                <Icon
                  size={21}
                  color={isActive ? "var(--nav-active)" : "var(--nav-muted)"}
                  aria-hidden="true"
                />
                <span style={{
                  fontSize:    10,
                  fontWeight:  isActive ? 700 : 500,
                  color:       isActive ? "var(--nav-active)" : "var(--nav-muted)",
                  letterSpacing: 0.2,
                  lineHeight:  1,
                  transition:  "color 0.15s",
                  fontFamily:  "var(--font-heading)",
                }}>
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

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ArrowRightIcon, ChevronRightIcon, GridIcon } from "@/components/ui/Icon";
import { PLATFORM_BRAND_ICONS } from "@/components/ui/Icon";

interface Platform { id: string; name: string; slug: string; iconUrl: string | null; _count: { services: number } }

export function HomePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["platforms"],
    queryFn: () => api.get<{ success: boolean; data: Platform[] }>("/services/platforms").then(r => r.data.data),
  });

  const walletBalance = user?.wallet?.balanceETB ?? 0;

  return (
    <div className="page animate-fade-in">

      {/* ── Greeting ── */}
      <div style={{ marginBottom: "var(--sp-5)" }}>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", marginBottom: 4 }}>Welcome back</p>
        <h1 style={{ fontSize: "var(--fs-2xl)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t1)" }}>
          {user?.firstName ?? "there"} 👋
        </h1>
      </div>

      {/* ── Hero ── */}
      <div
        style={{
          background:    "var(--hero-bg)",
          borderRadius:  "var(--r-xl)",
          padding:       "var(--sp-6)",
          marginBottom:  "var(--sp-5)",
          position:      "relative",
          overflow:      "hidden",
        }}
      >
        {/* Subtle accent circles */}
        <div style={{ position: "absolute", right: -20, top: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 30, bottom: -14, width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", fontSize: "var(--fs-xs)", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--cd-gold)", marginBottom: "var(--sp-2)" }}>
            Grow Faster
          </span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-xl)", fontWeight: 700, color: "#fff", marginBottom: "var(--sp-2)", lineHeight: "var(--lh-snug)" }}>
            Real Social<br/>Promotion Services
          </h2>
          <p style={{ fontSize: "var(--fs-sm)", color: "var(--hero-sub)", marginBottom: "var(--sp-5)", lineHeight: "var(--lh-normal)" }}>
            TikTok · Instagram · Facebook · YouTube
          </p>
          <button
            onClick={() => navigate("/services")}
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            6,
              background:     "var(--cd-gold)",
              color:          "var(--cd-navy)",
              border:         "none",
              borderRadius:   "var(--r-md)",
              padding:        "10px 18px",
              fontFamily:     "var(--font-heading)",
              fontWeight:     700,
              fontSize:       "var(--fs-sm)",
              cursor:         "pointer",
              letterSpacing:  0.1,
            }}
          >
            Browse Services
            <ArrowRightIcon size={15} color="var(--cd-navy)" />
          </button>
        </div>
      </div>

      {/* ── Quick stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-3)", marginBottom: "var(--sp-5)" }}>
        {[
          {
            label: "Wallet Balance",
            value: `${etbDisplay(walletBalance)} ETB`,
            action: () => navigate("/wallet"),
            actionLabel: "Top up",
          },
          {
            label: "My Orders",
            value: "View all",
            action: () => navigate("/orders"),
            actionLabel: "Open",
          },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              background:    "var(--surface)",
              border:        "1px solid var(--divider)",
              borderRadius:  "var(--r-lg)",
              padding:       "var(--sp-4)",
              textAlign:     "left",
              cursor:        "pointer",
              display:       "flex",
              flexDirection: "column",
              gap:           "var(--sp-1)",
            }}
          >
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
            <span style={{ fontSize: "var(--fs-base)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t1)" }}>{item.value}</span>
            <span style={{ fontSize: "var(--fs-xs)", color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>{item.actionLabel} →</span>
          </button>
        ))}
      </div>

      {/* ── Platforms ── */}
      <div className="section-header">
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--t1)" }}>
          Platforms
        </h2>
        <button
          onClick={() => navigate("/services")}
          style={{ fontSize: "var(--fs-sm)", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}
        >
          All <ChevronRightIcon size={14} color="var(--accent)" />
        </button>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message="Failed to load platforms" onRetry={() => refetch()} />}

      {data && (
        /* Horizontal scroll row — no 2-column grid */
        <div style={{
          display:    "flex",
          gap:        "var(--sp-3)",
          overflowX:  "auto",
          scrollbarWidth: "none",
          paddingBottom:  2,
          /* Negative margin so cards bleed to screen edge on mobile */
          marginLeft:  "calc(var(--sp-4) * -1)",
          marginRight: "calc(var(--sp-4) * -1)",
          paddingLeft: "var(--sp-4)",
          paddingRight:"var(--sp-4)",
        }}>
          {data.map(platform => {
            const BrandIcon = PLATFORM_BRAND_ICONS[platform.slug];

            /* Per-platform tint colours — subtle, works in both themes */
            const TINTS: Record<string, { bg: string; border: string }> = {
              tiktok:    { bg: "rgba(1,1,1,0.06)",        border: "rgba(1,1,1,0.10)" },
              instagram: { bg: "rgba(193,53,132,0.08)",   border: "rgba(193,53,132,0.18)" },
              facebook:  { bg: "rgba(24,119,242,0.07)",   border: "rgba(24,119,242,0.16)" },
              youtube:   { bg: "rgba(255,0,0,0.07)",      border: "rgba(255,0,0,0.16)" },
              telegram:  { bg: "rgba(0,136,204,0.07)",    border: "rgba(0,136,204,0.16)" },
              website:   { bg: "rgba(37,99,235,0.07)",    border: "rgba(37,99,235,0.16)" },
            };
            const tint = TINTS[platform.slug] ?? { bg: "rgba(212,175,55,0.08)", border: "rgba(212,175,55,0.20)" };

            return (
              <button
                key={platform.id}
                onClick={() => navigate(`/services?platform=${platform.slug}`)}
                style={{
                  flexShrink:     0,
                  width:          140,
                  background:     tint.bg,
                  border:         `1.5px solid ${tint.border}`,
                  borderRadius:   "var(--r-xl)",
                  padding:        "var(--sp-5) var(--sp-4) var(--sp-4)",
                  textAlign:      "center",
                  cursor:         "pointer",
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            "var(--sp-3)",
                  /* Override background in dark mode — keep the card visible against navy */
                  backdropFilter: "blur(0px)",
                }}
              >
                {/* Large brand icon — no background square, just the logo */}
                {BrandIcon
                  ? <BrandIcon size={44} />
                  : <GridIcon size={44} color="var(--t3)" />
                }

                <div>
                  <p style={{
                    fontFamily:  "var(--font-heading)",
                    fontWeight:  700,
                    fontSize:    "var(--fs-base)",
                    color:       "var(--t1)",
                    marginBottom: 3,
                    whiteSpace:  "nowrap",
                  }}>
                    {platform.name}
                  </p>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)" }}>
                    {platform._count.services} service{platform._count.services !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

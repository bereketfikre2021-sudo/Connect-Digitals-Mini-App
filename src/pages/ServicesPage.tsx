import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { GridIcon, PLATFORM_BRAND_ICONS } from "@/components/ui/Icon";

interface Platform { id: string; name: string; slug: string; _count: { services: number } }
interface Service {
  id: string; name: string; slug: string; shortDescription: string | null;
  targetType: string; targetLabel: string; fulfillmentType: string; sortOrder: number;
  platform: { name: string; slug: string; iconUrl: string | null };
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#010101", instagram: "#C13584", facebook: "#1877F2",
  youtube: "#FF0000", telegram: "#0088CC", website: "#2563EB",
};

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activePlatform = searchParams.get("platform") ?? "all";

  const { data: platforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: () => api.get<{ success: boolean; data: Platform[] }>("/services/platforms").then(r => r.data.data),
  });

  const { data: services, isLoading, error, refetch } = useQuery({
    queryKey: ["services", activePlatform],
    queryFn: async () => {
      if (activePlatform === "all")
        return api.get<{ success: boolean; data: Service[] }>("/services").then(r => r.data.data);
      return api.get<{ success: boolean; data: { id: string; name: string; slug: string; services: Omit<Service, "platform">[] } }>(
        `/services/platforms/${activePlatform}`
      ).then(r => {
        const { id, name, slug, services } = r.data.data;
        return services.map(svc => ({ ...svc, platform: { id, name, slug, iconUrl: null } }));
      });
    },
  });

  return (
    <div className="page animate-fade-in">
      <PageHeader title="Services" subtitle="Choose a promotion service" />

      {/* Platform filter tabs */}
      <div style={{ position: "relative", marginBottom: "var(--sp-5)" }}>
        <div
          style={{ display: "flex", gap: "var(--sp-2)", overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}
          role="tablist"
          aria-label="Filter by platform"
        >
          {/* All tab */}
          <button
            role="tab"
            aria-selected={activePlatform === "all"}
            onClick={() => setSearchParams({})}
            style={{
              flexShrink:   0,
              padding:      "8px 16px",
              borderRadius: "var(--r-full)",
              border:       "1.5px solid",
              borderColor:  activePlatform === "all" ? "var(--cd-red)" : "var(--divider)",
              background:   activePlatform === "all" ? "var(--cd-red)" : "var(--surface)",
              color:        activePlatform === "all" ? "#fff" : "var(--t2)",
              fontSize:     "var(--fs-sm)",
              fontWeight:   600,
              cursor:       "pointer",
              minHeight:    38,
              fontFamily:   "var(--font-heading)",
            }}
          >
            All
          </button>

          {platforms?.map(p => {
            const BrandIcon = PLATFORM_BRAND_ICONS[p.slug];
            const isActive = activePlatform === p.slug;
            return (
              <button
                key={p.slug}
                role="tab"
                aria-selected={isActive}
                aria-label={`Filter by ${p.name}`}
                onClick={() => setSearchParams({ platform: p.slug })}
                style={{
                  flexShrink:   0,
                  padding:      "8px 14px",
                  borderRadius: "var(--r-full)",
                  border:       "1.5px solid",
                  borderColor:  isActive ? "var(--cd-red)" : "var(--divider)",
                  background:   isActive ? "var(--cd-red)" : "var(--surface)",
                  color:        isActive ? "#fff" : "var(--t2)",
                  fontSize:     "var(--fs-sm)",
                  fontWeight:   600,
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          6,
                  minHeight:    38,
                  fontFamily:   "var(--font-heading)",
                }}
              >
                {BrandIcon
                  ? <span style={{ opacity: isActive ? 0.9 : 1 }}><BrandIcon size={15} /></span>
                  : <span style={{ width: 15, height: 15, borderRadius: "50%", background: PLATFORM_COLORS[p.slug] ?? "var(--t3)" }} />
                }
                {p.name}
              </button>
            );
          })}
        </div>
        {/* Fade mask */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 2, width: 40, background: "linear-gradient(to right, transparent, var(--bg))", pointerEvents: "none" }} aria-hidden="true" />
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage message="Failed to load services" onRetry={() => refetch()} />}

      {services && services.length === 0 && (
        <div style={{ textAlign: "center", padding: "var(--sp-12) var(--sp-4)", color: "var(--t3)", fontSize: "var(--fs-sm)" }}>
          No services available for this platform.
        </div>
      )}

      {services && services.length > 0 && (
        <div
          id="services-list"
          role="list"
          aria-label="Available services"
          style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}
        >
          {services.map(svc => {
            const BrandIcon = PLATFORM_BRAND_ICONS[svc.platform.slug];

            /* Platform accent colours */
            const ACCENTS: Record<string, { bar: string; tint: string; iconOpacity: number }> = {
              tiktok:    { bar: "#010101", tint: "rgba(1,1,1,0.045)",         iconOpacity: 0.90 },
              instagram: { bar: "#C13584", tint: "rgba(193,53,132,0.06)",     iconOpacity: 0.95 },
              facebook:  { bar: "#1877F2", tint: "rgba(24,119,242,0.06)",     iconOpacity: 0.95 },
              youtube:   { bar: "#FF0000", tint: "rgba(255,0,0,0.06)",        iconOpacity: 0.95 },
              telegram:  { bar: "#0088CC", tint: "rgba(0,136,204,0.06)",      iconOpacity: 0.95 },
              website:   { bar: "#2563EB", tint: "rgba(37,99,235,0.06)",      iconOpacity: 0.95 },
            };
            const accent = ACCENTS[svc.platform.slug] ?? { bar: "var(--cd-gold)", tint: "rgba(212,175,55,0.06)", iconOpacity: 0.95 };

            return (
              <button
                key={svc.id}
                role="listitem"
                onClick={() => navigate(`/services/${svc.slug}`)}
                aria-label={`${svc.name} — ${svc.platform.name}`}
                style={{
                  background:   `var(--surface)`,
                  border:       "1px solid var(--divider)",
                  borderRadius: "var(--r-lg)",
                  padding:      "0",
                  textAlign:    "left",
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "stretch",
                  overflow:     "hidden",
                  position:     "relative",
                }}
              >
                {/* Left accent bar — platform colour */}
                <div style={{
                  width:      4,
                  flexShrink: 0,
                  background: accent.bar,
                  borderRadius: "0",
                }} />

                {/* Card body with platform tint */}
                <div style={{
                  flex:       1,
                  background: accent.tint,
                  padding:    "var(--sp-4) var(--sp-4) var(--sp-4) var(--sp-4)",
                  display:    "flex",
                  alignItems: "center",
                  gap:        "var(--sp-3)",
                  minWidth:   0,
                }}>
                  {/* Text content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Platform name tag */}
                    <div style={{
                      display:      "inline-flex",
                      alignItems:   "center",
                      gap:          4,
                      marginBottom: 6,
                      padding:      "2px 7px",
                      background:   "var(--surface)",
                      borderRadius: "var(--r-full)",
                      border:       "1px solid var(--divider)",
                    }}>
                      {BrandIcon && <BrandIcon size={11} />}
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--t3)", letterSpacing: 0.3, textTransform: "uppercase" }}>
                        {svc.platform.name}
                      </span>
                    </div>

                    {/* Service name — dominant */}
                    <p style={{
                      fontFamily:   "var(--font-heading)",
                      fontWeight:   700,
                      fontSize:     "var(--fs-md)",
                      color:        "var(--t1)",
                      lineHeight:   "var(--lh-snug)",
                      marginBottom: svc.shortDescription ? 5 : 0,
                    }}>
                      {svc.name}
                    </p>

                    {svc.shortDescription && (
                      <p style={{
                        fontSize:     "var(--fs-sm)",
                        color:        "var(--t3)",
                        lineHeight:   "var(--lh-snug)",
                        display:      "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow:     "hidden",
                      }}>
                        {svc.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Large brand icon — floats freely, no container */}
                  <div style={{
                    flexShrink: 0,
                    opacity:    accent.iconOpacity,
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width:      52,
                    height:     52,
                  }}>
                    {BrandIcon
                      ? <BrandIcon size={48} />
                      : <GridIcon size={36} color="var(--t3)" />
                    }
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

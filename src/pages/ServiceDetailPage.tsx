import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay } from "@/lib/api";
import { useOrderStore } from "@/store/order.store";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { hapticLight } from "@/lib/telegram";
import { LinkIcon, PackageIcon, ClockIcon, ChevronRightIcon, GridIcon, PLATFORM_BRAND_ICONS } from "@/components/ui/Icon";

interface ServiceDetail {
  id: string; name: string; slug: string; description: string | null;
  targetType: string; targetLabel: string; targetPlaceholder: string;
  targetHelpText: string | null; requiresTargetUrl: boolean;
  platform: { id: string; name: string; slug: string };
  packages: Array<{
    id: string; name: string; description: string | null;
    quantity: number; priceETB: number;
    deliveryDaysMin: number; deliveryDaysMax: number; sortOrder: number;
  }>;
}

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { setService, setPackage } = useOrderStore();

  const { data: service, isLoading, error, refetch } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => api.get<{ success: boolean; data: ServiceDetail }>(`/services/${slug}`).then(r => r.data.data),
    enabled: !!slug,
  });

  const handleSelectPackage = (pkg: ServiceDetail["packages"][number]) => {
    if (!service) return;
    hapticLight();
    setService({ id: service.id, name: service.name, slug: service.slug, targetType: service.targetType, targetLabel: service.targetLabel, targetPlaceholder: service.targetPlaceholder, targetHelpText: service.targetHelpText, requiresTargetUrl: service.requiresTargetUrl, platform: service.platform });
    setPackage({ id: pkg.id, name: pkg.name, description: pkg.description, quantity: pkg.quantity, priceETB: pkg.priceETB, deliveryDaysMin: pkg.deliveryDaysMin, deliveryDaysMax: pkg.deliveryDaysMax });
    navigate("/order/new");
  };

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error || !service) return <div className="page"><ErrorMessage message="Service not found" onRetry={() => refetch()} /></div>;

  const BrandIcon = PLATFORM_BRAND_ICONS[service.platform.slug];

  return (
    <div className="page animate-fade-in">
      <PageHeader title={service.name} subtitle={service.platform.name} showBack />

      {/* Service hero */}
      <div style={{
        background:   "var(--hero-bg)",
        borderRadius: "var(--r-xl)",
        padding:      "var(--sp-5)",
        marginBottom: "var(--sp-5)",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "var(--sp-4)",
      }}>
        <div style={{
          width:          56,
          height:         56,
          borderRadius:   "var(--r-md)",
          background:     "var(--icon-gold-bg)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
        }}>
          {BrandIcon ? <BrandIcon size={32} /> : <GridIcon size={28} color="var(--icon-on-gold)" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--cd-gold)", fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
            {service.platform.name}
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-lg)", fontWeight: 700, color: "#fff", marginBottom: 6, lineHeight: "var(--lh-snug)" }}>
            {service.name}
          </h2>
          {service.description && (
            <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.65)", lineHeight: "var(--lh-normal)" }}>
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Target URL guidance */}
      {service.requiresTargetUrl && (
        <div style={{
          background:    "var(--accent-dim)",
          borderRadius:  "var(--r-md)",
          padding:       "var(--sp-3) var(--sp-4)",
          marginBottom:  "var(--sp-5)",
          display:       "flex",
          gap:           "var(--sp-3)",
          alignItems:    "flex-start",
          border:        "1px solid rgba(236,28,36,0.15)",
        }}>
          <LinkIcon size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
          <div>
            <p style={{ fontSize: "var(--fs-sm)", fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>
              {service.targetLabel}
            </p>
            {service.targetHelpText && (
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--t2)", lineHeight: "var(--lh-normal)" }}>
                {service.targetHelpText}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Package list */}
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-md)", fontWeight: 700, color: "var(--t1)", marginBottom: "var(--sp-3)" }}>
        Select a Package
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", paddingBottom: "var(--sp-4)" }}>
        {service.packages.map(pkg => (
          <button
            key={pkg.id}
            onClick={() => handleSelectPackage(pkg)}
            style={{
              background:    "var(--surface)",
              border:        "1.5px solid var(--divider)",
              borderRadius:  "var(--r-lg)",
              padding:       "var(--sp-4)",
              textAlign:     "left",
              cursor:        "pointer",
              display:       "flex",
              alignItems:    "center",
              gap:           "var(--sp-4)",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>
                  {pkg.name}
                </span>
                <span style={{
                  fontFamily:   "var(--font-heading)",
                  fontWeight:   700,
                  fontSize:     "var(--fs-md)",
                  color:        "var(--price)",
                  flexShrink:   0,
                  marginLeft:   "var(--sp-3)",
                }}>
                  {etbDisplay(pkg.priceETB)} ETB
                </span>
              </div>

              {pkg.description && (
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", marginBottom: 8, lineHeight: "var(--lh-snug)" }}>
                  {pkg.description}
                </p>
              )}

              <div style={{ display: "flex", gap: "var(--sp-4)", fontSize: "var(--fs-xs)", color: "var(--t3)", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <PackageIcon size={12} color="var(--t3)" aria-hidden="true" />
                  {pkg.quantity.toLocaleString()} units
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <ClockIcon size={12} color="var(--t3)" aria-hidden="true" />
                  {pkg.deliveryDaysMin}–{pkg.deliveryDaysMax} days
                </span>
              </div>
            </div>

            <ChevronRightIcon size={18} color="var(--t3)" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

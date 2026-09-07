import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, etbDisplay, formatDate } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BarChartIcon, ClockIcon, LinkIcon } from "@/components/ui/Icon";

// DownloadIcon shim — use PackageIcon as visual stand-in (Icon.tsx has no DownloadIcon)
function DownloadButtonIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

interface ReportData {
  id: string; title: string; periodStart: string | null; periodEnd: string | null;
  summary: Record<string, unknown> | null; fileUrl: string | null;
  publishedAt: string | null; createdAt: string;
  order: {
    id: string; orderNumber: string; targetUrl: string;
    service: { name: string; platform: { name: string } };
    package: { name: string; quantity: number };
  };
  campaign: {
    id: string; targetUrl: string; startDate: string | null; endDate: string | null;
    metrics: Array<{ date: string; source: string; impressions: number | null; reach: number | null; clicks: number | null; videoViews: number | null; likes: number | null; comments: number | null; shares: number | null; engagement: number | null; spendETB: number | null }>;
  } | null;
}

function MetricStat({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === 0) return null;
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--t1)", lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</p>
    </div>
  );
}

export function ReportPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ["report", id],
    queryFn:  () => api.get<{ success: boolean; data: ReportData }>(`/reports/${id}`).then(r => r.data.data),
    enabled:  !!id,
  });

  if (isLoading) return <div className="page"><Spinner /></div>;
  if (error || !report) return <div className="page"><ErrorMessage message="Report not found or not yet published" onRetry={() => refetch()} /></div>;

  const latestMetrics = report.campaign?.metrics[0];
  const summaryNotes  = typeof report.summary === "object" && report.summary !== null
    ? (report.summary["notes"] as string | undefined)
    : undefined;

  return (
    <div className="page animate-fade-in">
      <PageHeader title={report.title} subtitle={report.order.service.name} showBack />

      {/* Header */}
      <div style={{ background: "var(--hero-bg)", borderRadius: "var(--r-xl)", padding: "var(--sp-5)", marginBottom: "var(--sp-4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
          <BarChartIcon size={18} color="var(--cd-gold)" aria-hidden="true" />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-lg)", color: "#fff" }}>Campaign Report</span>
        </div>
        <p style={{ fontSize: "var(--fs-sm)", color: "rgba(255,255,255,0.65)" }}>
          {report.order.service.platform.name} · {report.order.service.name}
        </p>
        {report.publishedAt && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
            <ClockIcon size={11} color="rgba(255,255,255,0.45)" aria-hidden="true" />
            <p style={{ fontSize: "var(--fs-xs)", color: "rgba(255,255,255,0.45)" }}>Published {formatDate(report.publishedAt)}</p>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-3)" }}>
        <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Order</p>
        </div>
        {[
          { label: "Order #",   value: report.order.orderNumber },
          { label: "Package",   value: report.order.package.name },
          { label: "Quantity",  value: report.order.package.quantity.toLocaleString() },
        ].map(row => (
          <div key={row.label} className="info-row" style={{ padding: "10px var(--sp-4)" }}>
            <span style={{ fontSize: "var(--fs-sm)", color: "var(--t3)" }}>{row.label}</span>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500, color: "var(--t1)", textAlign: "right" }}>{row.value}</span>
          </div>
        ))}
        <div style={{ padding: "10px var(--sp-4)", display: "flex", gap: 6, alignItems: "flex-start" }}>
          <LinkIcon size={12} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          <a href={report.order.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-sm)", color: "var(--accent)", wordBreak: "break-all" }}>
            {report.order.targetUrl}
          </a>
        </div>
      </div>

      {/* Reporting period */}
      {(report.periodStart || report.periodEnd) && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-3)" }}>
          <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Reporting Period</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--sp-4)" }}>
            {report.periodStart && <div><p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 3 }}>From</p><p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>{formatDate(report.periodStart)}</p></div>}
            {report.periodEnd   && <div style={{ textAlign: "right" }}><p style={{ fontSize: "var(--fs-xs)", color: "var(--t3)", marginBottom: 3 }}>To</p><p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-base)", color: "var(--t1)" }}>{formatDate(report.periodEnd)}</p></div>}
          </div>
        </div>
      )}

      {/* Metrics */}
      {latestMetrics && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: "var(--sp-3)" }}>
          <div style={{ padding: "10px var(--sp-4)", background: "var(--surface-sunken)", borderBottom: "1px solid var(--divider)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6 }}>Performance</p>
            <span style={{
              fontSize:   "var(--fs-xs)", fontWeight: 700,
              background: latestMetrics.source === "MANUAL" ? "var(--s-warning-bg)" : "var(--s-info-bg)",
              color:      latestMetrics.source === "MANUAL" ? "var(--s-warning)" : "var(--s-info)",
              padding:    "2px 8px", borderRadius: "var(--r-full)",
            }}>
              {latestMetrics.source === "MANUAL" ? "Manually verified" : "Provider API"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-4)", padding: "var(--sp-5) var(--sp-4)" }}>
            <MetricStat label="Impressions" value={latestMetrics.impressions} />
            <MetricStat label="Reach"       value={latestMetrics.reach} />
            <MetricStat label="Clicks"      value={latestMetrics.clicks} />
            <MetricStat label="Video Views" value={latestMetrics.videoViews} />
            <MetricStat label="Likes"       value={latestMetrics.likes} />
            <MetricStat label="Comments"    value={latestMetrics.comments} />
            <MetricStat label="Shares"      value={latestMetrics.shares} />
            <MetricStat label="Engagement"  value={latestMetrics.engagement} />
            {latestMetrics.spendETB != null && <MetricStat label="Spend (ETB)" value={etbDisplay(latestMetrics.spendETB)} />}
          </div>
        </div>
      )}

      {/* Notes */}
      {summaryNotes && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--divider)", borderRadius: "var(--r-lg)", padding: "var(--sp-4)", marginBottom: "var(--sp-3)" }}>
          <p style={{ fontSize: "var(--fs-xs)", fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: "var(--sp-2)" }}>Notes</p>
          <p style={{ fontSize: "var(--fs-base)", color: "var(--t1)", lineHeight: "var(--lh-normal)" }}>{summaryNotes}</p>
        </div>
      )}

      {/* File download */}
      {report.fileUrl && (
        <a
          href={report.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download full report PDF"
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "var(--sp-2)",
            background:     "var(--hero-bg)",
            color:          "#fff",
            borderRadius:   "var(--r-lg)",
            padding:        "var(--sp-4)",
            fontFamily:     "var(--font-heading)",
            fontWeight:     700,
            fontSize:       "var(--fs-base)",
            marginBottom:   "var(--sp-3)",
            textDecoration: "none",
          }}
        >
          <DownloadButtonIcon size={18} color="#fff" /> Download Full Report
        </a>
      )}

      <button
        onClick={() => navigate(`/orders/${report.order.id}`)}
        style={{ width: "100%", padding: "var(--sp-3)", background: "none", border: "none", color: "var(--t3)", fontSize: "var(--fs-sm)", cursor: "pointer", minHeight: 44 }}
      >
        ← Back to Order
      </button>
    </div>
  );
}

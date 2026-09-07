import { useNavigate } from "react-router-dom";
import { WebApp } from "@/lib/telegram";
import { ArrowLeftIcon } from "@/components/ui/Icon";

interface PageHeaderProps {
  title:     string;
  subtitle?: string;
  showBack?: boolean;
  right?:    React.ReactNode;
}

export function PageHeader({ title, subtitle, showBack, right }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
    try { WebApp.BackButton.hide(); } catch { /* noop */ }
  };

  return (
    <div
      style={{
        display:       "flex",
        alignItems:    "center",
        gap:           "var(--sp-3)",
        marginBottom:  "var(--sp-5)",
        minHeight:     44,
      }}
    >
      {showBack && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          style={{
            width:                40,
            height:               40,
            borderRadius:         "var(--r-md)",
            /* Same glass treatment as the nav */
            background:           "rgba(var(--glass-base), 0.55)",
            backdropFilter:       "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border:               "1px solid rgba(var(--glass-border), 0.15)",
            display:              "flex",
            alignItems:           "center",
            justifyContent:       "center",
            flexShrink:           0,
            cursor:               "pointer",
          }}
        >
          <ArrowLeftIcon size={18} color="var(--t2)" />
        </button>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontFamily:   "var(--font-heading)",
            fontSize:     subtitle ? "var(--fs-lg)" : "var(--fs-xl)",
            fontWeight:   700,
            color:        "var(--t1)",
            lineHeight:   "var(--lh-tight)",
            whiteSpace:   "nowrap",
            overflow:     "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize:     "var(--fs-sm)",
              color:        "var(--t3)",
              marginTop:    2,
              whiteSpace:   "nowrap",
              overflow:     "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

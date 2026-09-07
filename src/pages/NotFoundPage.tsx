import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/Icon";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      minHeight:      "80vh",
      padding:        "var(--sp-6)",
      textAlign:      "center",
      gap:            "var(--sp-4)",
    }}>
      <div style={{
        width:          72,
        height:         72,
        borderRadius:   "var(--r-xl)",
        background:     "var(--surface)",
        border:         "1px solid var(--divider)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        <SearchIcon size={32} color="var(--t3)" aria-hidden="true" />
      </div>

      <div>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "var(--fs-xl)", color: "var(--t1)", marginBottom: 8 }}>
          Page Not Found
        </p>
        <p style={{ fontSize: "var(--fs-base)", color: "var(--t3)", lineHeight: "var(--lh-normal)", maxWidth: 260 }}>
          This page doesn't exist or has been moved.
        </p>
      </div>

      <Button variant="primary" size="md" onClick={() => navigate("/", { replace: true })}>
        Go Home
      </Button>
    </div>
  );
}

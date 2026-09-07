import { AlertIcon } from "@/components/ui/Icon";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = "Something went wrong", onRetry }: Props) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        textAlign:      "center",
        padding:        "var(--sp-10) var(--sp-4)",
        gap:            "var(--sp-4)",
      }}
    >
      <div style={{
        width:          52,
        height:         52,
        borderRadius:   "50%",
        background:     "var(--s-error-bg)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        <AlertIcon size={24} color="var(--s-error)" aria-hidden="true" />
      </div>

      <div>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-base)", fontWeight: 600, color: "var(--t1)", marginBottom: "var(--sp-1)" }}>
          Something went wrong
        </p>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--t3)", lineHeight: "var(--lh-normal)" }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily:  "var(--font-heading)",
            fontSize:    "var(--fs-sm)",
            fontWeight:  600,
            color:       "var(--accent)",
            background:  "none",
            border:      "none",
            cursor:      "pointer",
            padding:     "var(--sp-2) var(--sp-4)",
            minHeight:   44,
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

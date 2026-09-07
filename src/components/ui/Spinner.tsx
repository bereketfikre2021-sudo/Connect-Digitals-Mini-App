/** Spinner — centred loading indicator */
export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--sp-8)",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width:  size,
          height: size,
          border: "2.5px solid var(--divider)",
          borderTopColor: "var(--cd-red)",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}

export function InlineSpinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <span
      className="animate-spin"
      style={{
        display: "inline-block",
        width:   size,
        height:  size,
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        borderRadius: "50%",
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

/** Full-page loading overlay */
export function FullPageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        position:        "fixed",
        inset:           0,
        background:      "var(--bg)",
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             "var(--sp-4)",
        zIndex:          9999,
      }}
    >
      <div style={{ position: "relative", width: 48, height: 48 }}>
        {/* Outer ring */}
        <div style={{ position: "absolute", inset: 0, border: "2px solid var(--divider)", borderRadius: "50%" }} />
        {/* Spinning arc */}
        <div
          className="animate-spin"
          style={{
            position: "absolute", inset: 0,
            border: "2px solid transparent",
            borderTopColor: "var(--cd-red)",
            borderRadius: "50%",
          }}
        />
        {/* Center dot */}
        <div style={{ position: "absolute", inset: "14px", borderRadius: "50%", background: "var(--cd-red)" }} />
      </div>
      <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--fs-sm)", color: "var(--t3)", letterSpacing: 0.5 }}>
        Loading
      </p>
    </div>
  );
}

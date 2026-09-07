import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  fullWidth?: boolean;
  icon?:     React.ReactNode;
  iconRight?: React.ReactNode;
}

const BASE = [
  "inline-flex items-center justify-center gap-2",
  "font-semibold select-none",
  "transition-all duration-150",
  "-webkit-tap-highlight-color-transparent",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
].join(" ");

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--cd-red)] text-white " +
    "hover:bg-[var(--cd-red-dark)] active:scale-[0.97] " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] " +
    "border border-[var(--btn-secondary-border)] " +
    "hover:opacity-85 active:scale-[0.97] " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-[var(--btn-ghost-text)] " +
    "border border-[var(--btn-ghost-border)] " +
    "hover:bg-[var(--cd-red)] hover:text-white hover:border-[var(--cd-red)] " +
    "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-[var(--s-error)] text-white " +
    "hover:opacity-90 active:scale-[0.97] " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  subtle:
    "bg-[var(--accent-dim)] text-[var(--accent)] " +
    "hover:bg-[var(--cd-red)] hover:text-white " +
    "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
};

const SIZES: Record<Size, { cls: string; spinnerSize: number }> = {
  sm: { cls: "h-9 px-4 text-[13px] rounded-[var(--r-md)]", spinnerSize: 14 },
  md: { cls: "h-12 px-5 text-[15px] rounded-[var(--r-md)]", spinnerSize: 16 },
  lg: { cls: "h-14 px-6 text-[16px] rounded-[var(--r-lg)]", spinnerSize: 18 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, icon, iconRight, className = "", children, disabled, ...props }, ref) => {
    const { cls, spinnerSize } = SIZES[size];
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[BASE, VARIANTS[variant], cls, fullWidth ? "w-full" : "", className].join(" ")}
        style={{ fontFamily: "var(--font-heading)" }}
        {...props}
      >
        {loading
          ? <span
              style={{ width: spinnerSize, height: spinnerSize, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }}
              className="animate-spin"
              aria-hidden="true"
            />
          : icon
        }
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = "Button";

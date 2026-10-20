import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "link" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent px-5 py-2.5 text-ground hover:bg-accent-dim",
  ghost: "border border-line px-5 py-2.5 text-ink hover:border-ink/40",
  link: "text-accent underline-offset-4 hover:text-accent-dim hover:underline",
  danger:
    "border border-danger/40 px-5 py-2.5 text-danger hover:border-danger hover:bg-danger/10",
};

export function buttonClass(variant: Variant = "primary", extra?: string): string {
  return cn(base, variants[variant], extra);
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

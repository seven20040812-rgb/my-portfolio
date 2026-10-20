import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-sm border border-line bg-ground px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-faint focus:border-accent/60 focus:outline-none";

export const labelClass =
  "font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint";

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

import type { ReactNode } from "react";

export function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
        {index}
      </span>
      <span className="h-px w-6 bg-line" />
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-muted">
        {children}
      </span>
    </div>
  );
}

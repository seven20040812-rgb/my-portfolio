import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
      {children}
    </span>
  );
}

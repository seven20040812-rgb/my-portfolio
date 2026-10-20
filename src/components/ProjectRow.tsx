import { Link } from "react-router-dom";

import type { Project } from "@/api/types";
import { formatYear } from "@/lib/format";
import { ArrowIcon } from "./ui/ArrowIcon";

export function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <Link
      to={`/projects/${project.id}`}
      data-reveal
      style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
      className="group grid grid-cols-12 items-center gap-4 border-b border-line py-6 transition-colors hover:bg-ground-2/50 md:py-7"
    >
      <span className="col-span-2 font-mono text-[11px] text-ink-faint md:col-span-1">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="col-span-10 md:col-span-6">
        <h3 className="font-display text-xl font-medium tracking-tight text-ink transition-colors group-hover:text-accent md:text-2xl">
          {project.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-ink-muted">
          {project.summary}
        </p>
      </div>

      <div className="col-span-12 flex flex-wrap gap-x-3 gap-y-1 md:col-span-3">
        {project.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="col-span-12 flex items-center justify-between md:col-span-2 md:justify-end md:gap-4">
        <span className="font-mono text-[11px] text-ink-faint">
          {formatYear(project.createdAt)}
        </span>
        <ArrowIcon className="h-4 w-4 text-ink-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent" />
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { MaskText } from "@/components/ui/MaskText";
import { ProjectRow } from "@/components/ProjectRow";

export function ProjectsPage() {
  const { projects, loading } = useData();

  if (loading) return <PageLoader />;

  return (
    <section className="container-content py-16 md:py-24">
      <div data-reveal className="flex items-end justify-between gap-6">
        <div>
          <SectionLabel index="WORK">项目档案</SectionLabel>
          <h1 className="display-l mt-6 text-ink">
            <MaskText>作品</MaskText>
          </h1>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
          {String(projects.length).padStart(2, "0")} 项
        </span>
      </div>

      <div className="mt-12 border-t border-line">
        {projects.length > 0 ? (
          projects.map((project, i) => (
            <ProjectRow key={project.id} project={project} index={i} />
          ))
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm text-ink-muted">还没有项目。</p>
            <Link
              to="/"
              className="mt-4 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-accent hover:text-accent-dim"
            >
              返回首页
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

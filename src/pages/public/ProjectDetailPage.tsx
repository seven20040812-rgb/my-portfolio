import { Link, useParams } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { buttonClass } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { CelestialChart } from "@/components/CelestialChart";
import { MaskText } from "@/components/ui/MaskText";
import { formatDate } from "@/lib/format";

export function ProjectDetailPage() {
  const { id } = useParams();
  const { projects, loading } = useData();

  if (loading) return <PageLoader />;

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <section className="container-content py-24 text-center">
        <p className="eyebrow">OBJECT NOT FOUND</p>
        <h1 className="display-l mt-6 text-ink">项目不在星图中。</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-muted">
          该编号未对应任何已记录的观测对象，它可能已被移除。
        </p>
        <Link to="/projects" className={buttonClass("ghost", "mt-8")}>
          返回项目列表
        </Link>
      </section>
    );
  }

  return (
    <article className="container-content py-16 md:py-24">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
      >
        <span aria-hidden="true">←</span>
        返回项目
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <header data-reveal className="lg:col-span-7">
          <SectionLabel index="OBJECT">项目</SectionLabel>
          <h1 className="display-l mt-6 text-ink">
            <MaskText>{project.title}</MaskText>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            {project.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <aside
          data-reveal
          style={{ animationDelay: "120ms" }}
          className="lg:col-span-4 lg:col-start-9"
        >
          <dl className="space-y-4 border-t border-line pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                记录时间
              </dt>
              <dd className="font-mono text-xs text-ink">
                {formatDate(project.createdAt)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                精选
              </dt>
              <dd className="text-sm text-ink">
                {project.featured ? "是" : "否"}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary")}
              >
                访问在线地址
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("ghost")}
              >
                查看源码
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </aside>
      </div>

      <div
        data-reveal
        className="mt-14 overflow-hidden rounded-sm border border-line"
      >
        {project.cover ? (
          <img
            src={project.cover}
            alt={project.title}
            className="w-full object-cover"
          />
        ) : (
          <div className="bg-ground-2/40 p-6">
            <CelestialChart className="mx-auto w-full max-w-sm" />
          </div>
        )}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-8 lg:col-start-1">
          {project.detail.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="mb-5 whitespace-pre-line text-base leading-relaxed text-ink-muted"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

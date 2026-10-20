import { Link } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { buttonClass } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PageLoader } from "@/components/ui/PageLoader";
import { CelestialChart } from "@/components/CelestialChart";
import { ProjectRow } from "@/components/ProjectRow";
import { Avatar } from "@/components/ui/Avatar";
import { MaskText } from "@/components/ui/MaskText";

export function HomePage() {
  const { profile, projects, loading } = useData();

  if (loading || !profile) return <PageLoader />;

  const featured = projects.filter((p) => p.featured);
  const showcase = (featured.length > 0 ? featured : projects).slice(0, 3);
  const intro = profile.bio.split("\n\n")[0];

  return (
    <>
      {/* Hero */}
      <section className="container-content pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
          <div data-reveal className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-accent/60" />
              <span className="eyebrow">PORTFOLIO — 2026</span>
            </div>

            <h1 className="display-xl mt-6 text-ink">
              <MaskText delay={80}>{profile.name}</MaskText>
            </h1>

            <p className="mt-5 font-mono text-sm tracking-[0.04em] text-accent">
              {profile.title}
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
              {intro}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/projects" className={buttonClass("primary", "group")}>
                查看项目
                <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link to="/resume" className={buttonClass("ghost")}>
                下载简历
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
              {[
                ["坐标", profile.location],
                ["状态", profile.availability],
                ["联络", profile.email],
              ].map(([label, value]) => (
                <div key={label} className="bg-ground px-4 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    {label}
                  </dt>
                  <dd className="mt-1 truncate text-sm text-ink">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            data-reveal
            style={{ animationDelay: "160ms" }}
            className="lg:col-span-5 lg:col-start-8"
          >
            <div className="relative">
              <CelestialChart className="mx-auto w-full max-w-md" />
              <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                <span>FIG.01 — 观测坐标</span>
                <span>N 31°14′ / E 121°29′</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills index */}
      <section className="border-t border-line">
        <div className="container-content grid gap-12 py-20 md:py-28 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <SectionLabel index="01">能力索引 / INDEX</SectionLabel>
            <h2 className="display-l mt-6 max-w-md text-ink">
              <MaskText>把复杂系统，收敛为可读的界面。</MaskText>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
              我在产品与工程之间取舍：让结构清晰、动线明确，剩下的交给留白与细节。
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {profile.skills.map((skill, i) => (
                <li
                  key={skill}
                  data-reveal
                  style={{ animationDelay: `${i * 45}ms` }}
                  className="flex items-center justify-between border-b border-line py-3.5"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-ink">{skill}</span>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-accent/60" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Featured work */}
      <section className="border-t border-line">
        <div className="container-content py-20 md:py-28">
          <div data-reveal className="flex items-end justify-between gap-6">
            <div>
              <SectionLabel index="02">精选项目 / SELECTED</SectionLabel>
              <h2 className="display-l mt-6 text-ink">
                <MaskText>作品</MaskText>
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-accent sm:inline-flex"
            >
              全部项目
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-10 border-t border-line">
            {showcase.length > 0 ? (
              showcase.map((project, i) => (
                <ProjectRow key={project.id} project={project} index={i} />
              ))
            ) : (
              <p className="py-12 text-center text-sm text-ink-muted">
                项目即将上线。
              </p>
            )}
          </div>

          <Link
            to="/projects"
            className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-accent sm:hidden"
          >
            全部项目
            <ArrowIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="border-t border-line">
        <div className="container-content grid gap-12 py-20 md:py-28 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-5">
            <SectionLabel index="03">关于 / ABOUT</SectionLabel>
            <h2 className="display-l mt-6 max-w-md text-ink">
              <MaskText>一个在设计与工程之间工作的人。</MaskText>
            </h2>
          </div>

          <div
            data-reveal
            style={{ animationDelay: "120ms" }}
            className="flex gap-6 lg:col-span-6 lg:col-start-7"
          >
            <Avatar src={profile.avatar} name={profile.name} size="sm" />
            <div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                {profile.bio.split("\n\n").slice(1, 3).join("\n\n")}
              </p>
              <Link
                to="/about"
                className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-accent-dim"
              >
                完整介绍
                <ArrowIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-line">
        <div data-reveal className="container-content py-20 md:py-28">
          <SectionLabel index="04">联络 / CONTACT</SectionLabel>
          <h2 className="display-xl mt-6 max-w-3xl text-ink">
            <MaskText>有想法，一起聊聊。</MaskText>
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${profile.email}`}
              className={buttonClass("primary", "group")}
            >
              {profile.email}
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {profile.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

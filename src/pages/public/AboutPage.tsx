import { useData } from "@/context/DataContext";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function AboutPage() {
  const { profile, loading } = useData();

  if (loading || !profile) return <PageLoader />;

  return (
    <section className="container-content py-16 md:py-24">
      <SectionLabel index="ABOUT">关于我</SectionLabel>

      <div className="mt-12 grid gap-14 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <Avatar src={profile.avatar} name={profile.name} size="lg" />
          <h1 className="mt-6 font-display text-3xl font-medium tracking-tight text-ink">
            {profile.name}
          </h1>
          <p className="mt-2 font-mono text-xs tracking-[0.04em] text-accent">
            {profile.title}
          </p>

          <dl className="mt-8 space-y-4 border-t border-line pt-6">
            {[
              ["坐标", profile.location],
              ["状态", profile.availability],
              ["联络", profile.email],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4">
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                  {label}
                </dt>
                <dd className="truncate text-sm text-ink">{value || "—"}</dd>
              </div>
            ))}
          </dl>

          {profile.socials.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="eyebrow">社交</p>
              <ul className="mt-3 space-y-2">
                {profile.socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between text-sm text-ink-muted hover:text-ink"
                    >
                      {social.platform}
                      <span className="font-mono text-[10px] text-ink-faint transition-colors group-hover:text-accent">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Body */}
        <div className="lg:col-span-7 lg:col-start-6">
          <h2 className="display-l text-ink">在设计与工程之间。</h2>
          <div className="mt-8 space-y-5">
            {profile.bio.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="whitespace-pre-line text-base leading-relaxed text-ink-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="eyebrow">能力 / SKILLS</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {profile.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-sm border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

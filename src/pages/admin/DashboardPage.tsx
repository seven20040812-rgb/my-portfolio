import { Link } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { formatDate } from "@/lib/format";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-sm border border-line bg-ground-2/30 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { profile, projects, resume, loading } = useData();

  if (loading || !profile) return <PageLoader />;

  const featured = projects.filter((p) => p.featured).length;

  const fields = [
    profile.name,
    profile.title,
    profile.bio,
    profile.avatar,
    profile.location,
    profile.email,
    profile.skills.length ? "y" : "",
    profile.socials.length ? "y" : "",
  ];
  const completeness = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  );

  const timestamps = [
    profile.updatedAt,
    ...projects.map((p) => p.updatedAt),
    ...(resume ? [resume.uploadedAt] : []),
  ]
    .map((t) => new Date(t).getTime())
    .filter((n) => !Number.isNaN(n));
  const lastUpdated = timestamps.length
    ? formatDate(new Date(Math.max(...timestamps)).toISOString())
    : "—";

  return (
    <div>
      <header>
        <p className="eyebrow">OVERVIEW</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
          仪表盘
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          欢迎回来，{profile.name}。以下是当前站点的状态概览。
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="项目总数" value={String(projects.length)} hint={`${featured} 个精选`} />
        <StatCard label="个人信息完成度" value={`${completeness}%`} hint="完善资料更可信" />
        <StatCard
          label="简历"
          value={resume ? "已上传" : "未上传"}
          hint={resume ? resume.fileName : "点击上传"}
        />
        <StatCard label="最近更新" value={lastUpdated} />
      </div>

      <section className="mt-10">
        <p className="eyebrow">快捷操作</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/admin/profile", title: "编辑资料", desc: "个人信息与头像" },
            { to: "/admin/projects", title: "项目管理", desc: "增删改 / 排序 / 精选" },
            { to: "/admin/resume", title: "简历", desc: "上传或替换文件" },
            { to: "/admin/settings", title: "数据", desc: "导入 / 导出 / 重置" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-sm border border-line bg-ground-2/20 p-5 transition-colors hover:border-accent/40 hover:bg-ground-2/40"
            >
              <p className="font-display text-base font-medium text-ink group-hover:text-accent">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

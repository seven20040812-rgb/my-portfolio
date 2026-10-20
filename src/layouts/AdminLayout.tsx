import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { cn } from "@/lib/cn";

const navItems = [
  { to: "/admin", label: "仪表盘", end: true },
  { to: "/admin/profile", label: "个人资料" },
  { to: "/admin/projects", label: "项目" },
  { to: "/admin/resume", label: "简历" },
  { to: "/admin/settings", label: "设置" },
];

export function AdminLayout() {
  const { profile } = useData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
      isActive
        ? "bg-ground text-accent"
        : "text-ink-muted hover:bg-ground/60 hover:text-ink"
    );

  return (
    <div className="min-h-screen bg-ground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-ground-2/30 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <span className="grid h-6 w-6 place-items-center rounded-sm border border-line font-mono text-[10px] text-accent">
            A
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              Control Room
            </p>
            <p className="truncate text-sm text-ink">{profile?.name ?? "管理后台"}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => linkClass(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <NavLink to="/" className={linkClass(false)}>
            返回前台 ↗
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:bg-ground/60 hover:text-danger"
          >
            退出登录
          </button>
        </div>
      </aside>

      <div className="md:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-ground/85 backdrop-blur">
          <div className="container-content flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="md:hidden grid h-6 w-6 place-items-center rounded-sm border border-line font-mono text-[10px] text-accent">
                A
              </span>
              <span className="eyebrow">管理后台 / ADMIN</span>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
              >
                前台 ↗
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-danger md:hidden"
              >
                退出
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="container-content flex gap-1 overflow-x-auto pb-2 md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em]",
                    isActive ? "bg-ground-2 text-accent" : "text-ink-muted"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="container-content py-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

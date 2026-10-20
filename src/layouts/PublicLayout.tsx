import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { cn } from "@/lib/cn";
import { StarField } from "@/components/StarField";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

const navItems = [
  { to: "/", label: "首页", end: true },
  { to: "/about", label: "关于" },
  { to: "/projects", label: "项目" },
  { to: "/resume", label: "简历" },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Wordmark({ name }: { name: string }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" aria-hidden="true">
        <path
          d="M12 2v6M12 16v6M2 12h6M16 12h6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      </svg>
      <span className="font-display text-[15px] font-medium tracking-tight text-ink">
        {name}
      </span>
    </Link>
  );
}

export function PublicLayout() {
  const { profile } = useData();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = profile?.name ?? "星图";

  return (
    <>
      <StarField />
      <ScrollToTop />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-ground/70 backdrop-blur-md">
        <div className="container-content flex h-16 items-center justify-between">
          <Wordmark name={name} />

          <nav className="hidden items-center gap-8 md:flex" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                    isActive ? "text-ink" : "text-ink-muted hover:text-ink"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/resume"
            className="hidden items-center gap-2 rounded-sm border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-accent/50 hover:text-accent md:inline-flex"
          >
            简历
            <ArrowIcon className="h-3 w-3" />
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-sm text-ink-muted md:hidden"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="font-mono text-lg leading-none">
              {menuOpen ? "×" : "≡"}
            </span>
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-line bg-ground/95 md:hidden">
            <nav className="container-content flex flex-col py-2" aria-label="移动导航">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between py-3 font-mono text-xs uppercase tracking-[0.18em]",
                      isActive ? "text-ink" : "text-ink-muted"
                    )
                  }
                >
                  {item.label}
                  <ArrowIcon className="h-3.5 w-3.5 opacity-50" />
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16">
        <Outlet />
      </main>

      <Footer name={name} />
    </>
  );
}

function Footer({ name }: { name: string }) {
  const { profile } = useData();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-line">
      <div className="container-content py-16">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="max-w-sm">
            <p className="eyebrow">END OF OBSERVATION</p>
            <p className="mt-4 font-display text-3xl font-medium tracking-tight text-ink">
              {name}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {profile?.title ?? ""}
            </p>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="eyebrow">导航</p>
              <ul className="mt-4 space-y-2.5">
                {navItems.slice(1).map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="text-sm text-ink-muted hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow">联络</p>
              <ul className="mt-4 space-y-2.5">
                {(profile?.socials ?? []).map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-ink-muted hover:text-ink"
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
                {profile?.email && (
                  <li>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-sm text-ink-muted hover:text-ink"
                    >
                      {profile.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[11px] tracking-[0.1em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {name}
          </span>
          <span className="uppercase">{profile?.location ?? ""}</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-fit uppercase transition-colors hover:text-ink"
          >
            返回顶部 ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { StarField } from "@/components/StarField";
import { CelestialChart } from "@/components/CelestialChart";
import { PageLoader } from "@/components/ui/PageLoader";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const ok = await login(password);
    setBusy(false);
    if (ok) navigate(from, { replace: true });
    else setError("口令不正确，请重试。");
  };

  return (
    <div className="relative grid min-h-screen place-items-center px-6">
      <StarField />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-sm border border-line bg-ground-2/50 shadow-2xl md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between border-r border-line p-10 md:flex">
          <div>
            <p className="eyebrow">CONTROL ROOM</p>
            <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-ink">
              管理后台
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              在这里维护个人信息、项目与简历。所有改动即时持久化，前台刷新即生效。
            </p>
          </div>
          <CelestialChart className="mx-auto w-full max-w-[220px]" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10">
          <div className="md:hidden">
            <p className="eyebrow">CONTROL ROOM</p>
            <h1 className="mt-3 font-display text-2xl text-ink">管理后台</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 md:mt-0">
            <Field label="访问口令" htmlFor="password">
              <input
                id="password"
                type="password"
                autoFocus
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <p className="mt-3 text-xs text-danger" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="mt-6 w-full"
              disabled={busy || password.length === 0}
            >
              {busy ? "验证中…" : "进入后台"}
            </Button>

            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              演示环境默认口令为 <code className="text-ink-muted">admin</code>
              ，正式部署前请通过 <code className="text-ink-muted">VITE_ADMIN_PASSWORD</code>{" "}
              修改。
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

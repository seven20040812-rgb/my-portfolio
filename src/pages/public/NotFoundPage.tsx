import { Link } from "react-router-dom";

import { buttonClass } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";

export function NotFoundPage() {
  return (
    <section className="container-content grid min-h-[70vh] place-items-center py-24">
      <div className="max-w-lg text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-faint">
          ERROR 404
        </p>
        <h1 className="display-xl mt-6 text-ink">此页不在星图中。</h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
          你访问的坐标没有对应任何观测记录，它也许早已漂移出视野。
        </p>
        <Link to="/" className={buttonClass("primary", "mt-10")}>
          返回首页
          <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";

import { useData } from "@/context/DataContext";
import { PageLoader } from "@/components/ui/PageLoader";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { buttonClass } from "@/components/ui/Button";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { formatBytes, formatDate } from "@/lib/format";

export function ResumePage() {
  const { resume, loading } = useData();

  if (loading) return <PageLoader />;

  return (
    <section className="container-content py-16 md:py-24">
      <SectionLabel index="RESUME">简历</SectionLabel>

      {!resume ? (
        <div className="mt-12 grid min-h-[40vh] place-items-center rounded-sm border border-line bg-ground-2/30">
          <div className="max-w-sm px-6 py-16 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              NO DOCUMENT
            </p>
            <h1 className="mt-4 font-display text-2xl font-medium text-ink">
              简历暂未提供。
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              文件尚未上传，稍后再来看看，或直接来信索取。
            </p>
            <Link to="/" className={buttonClass("ghost", "mt-8")}>
              返回首页
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <div>
              <h1 className="display-l text-ink">简历</h1>
              <p className="mt-3 font-mono text-sm text-ink-muted">
                {resume.fileName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
              {resume.size > 0 && <span>{formatBytes(resume.size)}</span>}
              <span>更新于 {formatDate(resume.uploadedAt)}</span>
              <a
                href={resume.dataUrl}
                download={resume.fileName}
                className={buttonClass("primary")}
              >
                下载简历
                <ArrowIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-sm border border-line bg-ground-2/40">
            {resume.mimeType.includes("pdf") ? (
              <iframe
                title="简历预览"
                src={resume.dataUrl}
                className="h-[80vh] w-full"
              />
            ) : (
              <div className="grid min-h-[40vh] place-items-center px-6 py-16 text-center">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
                    DOCUMENT
                  </p>
                  <p className="mt-3 text-sm text-ink-muted">
                    该格式无法在浏览器内直接预览，请下载查看完整简历。
                  </p>
                  <a
                    href={resume.dataUrl}
                    download={resume.fileName}
                    className={buttonClass("ghost", "mt-6")}
                  >
                    下载查看
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

import { useRef, useState } from "react";

import { api } from "@/api";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { formatBytes, formatDate } from "@/lib/format";

const MAX_MB = 4;
const ACCEPT = ".pdf,.doc,.docx";

export default function ResumeManagePage() {
  const { resume, loading, reload } = useData();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (loading) return <PageLoader />;

  const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const okType = /(pdf|msword|officedocument\.wordprocessingml\.document)$/.test(
      file.type
    ) || /\.(pdf|docx?)$/i.test(file.name);
    if (!okType) {
      toast("请上传 PDF / DOC / DOCX 文件", "error");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`文件需小于 ${MAX_MB}MB（本地存储容量有限）`, "error");
      return;
    }

    setBusy(true);
    try {
      await api.resume.upload(file);
      await reload();
      toast("简历已上传");
    } catch {
      toast("上传失败，文件可能过大", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    await api.resume.remove();
    await reload();
    setConfirmDelete(false);
    toast("简历已删除");
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">RESUME</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            简历
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            支持 PDF / DOC / DOCX，文件以 Base64 存入本地存储。
          </p>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "上传中…" : resume ? "替换文件" : "上传简历"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handlePick}
        />
      </header>

      {!resume ? (
        <div className="mt-8 grid min-h-[36vh] place-items-center rounded-sm border border-dashed border-line bg-ground-2/20">
          <div className="px-6 py-16 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              NO DOCUMENT
            </p>
            <h2 className="mt-3 font-display text-xl text-ink">尚未上传简历</h2>
            <p className="mt-2 text-sm text-ink-muted">
              上传后，前台「简历」页将支持在线预览与下载。
            </p>
            <Button
              className="mt-6"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              选择文件
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-line bg-ground-2/30 p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-sm border border-line font-mono text-[10px] uppercase text-accent">
                {resume.fileName.split(".").pop()?.toUpperCase().slice(0, 4)}
              </span>
              <div>
                <p className="font-display text-base text-ink">{resume.fileName}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                  {formatBytes(resume.size)} · 更新于 {formatDate(resume.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={resume.dataUrl}
                download={resume.fileName}
                className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm text-ink hover:border-ink/40"
              >
                下载
              </a>
              <Button variant="ghost" onClick={() => inputRef.current?.click()}>
                替换
              </Button>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                删除
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-sm border border-line bg-ground-2/40">
            {resume.mimeType.includes("pdf") ? (
              <iframe
                title="简历预览"
                src={resume.dataUrl}
                className="h-[70vh] w-full"
              />
            ) : (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">
                该文件类型无法在线预览，请下载查看。
              </p>
            )}
          </div>
        </div>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="确认删除简历"
      >
        <p className="text-sm text-ink-muted">删除后前台将不再提供简历下载。确定继续？</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => void handleDelete()}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

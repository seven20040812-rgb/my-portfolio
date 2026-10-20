import { useRef, useState } from "react";

import { api } from "@/api";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { formatBytes } from "@/lib/format";

function estimateUsage(): number {
  let bytes = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith("portfolio:v1:")) {
      bytes += (localStorage.getItem(key)?.length ?? 0) * 2;
    }
  }
  return bytes;
}

export default function SettingsPage() {
  const { loading, reload } = useData();
  const toast = useToast();
  const importRef = useRef<HTMLInputElement>(null);

  const [usage] = useState<number>(() => estimateUsage());
  const [importText, setImportText] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  if (loading) return <PageLoader />;

  const quota = 5 * 1024 * 1024;
  const percent = Math.min(100, Math.round((usage / quota) * 100));

  const handleExport = async () => {
    const json = await api.db.export();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("数据已导出");
  };

  const handleImportPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    setImportText(text);
  };

  const applyImport = async () => {
    if (!importText) return;
    try {
      await api.db.import(importText);
      await reload();
      toast("数据已导入");
    } catch {
      toast("导入失败：文件格式无效", "error");
    } finally {
      setImportText(null);
    }
  };

  const applyReset = async () => {
    await api.db.reset();
    await reload();
    setResetOpen(false);
    toast("已恢复默认数据");
  };

  return (
    <div>
      <header>
        <p className="eyebrow">SETTINGS</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
          设置
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          备份、迁移或重置本站数据。所有数据保存在浏览器本地。
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Backup */}
        <section className="rounded-sm border border-line bg-ground-2/20 p-6">
          <h2 className="font-display text-lg text-ink">备份与迁移</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            导出为 JSON 文件用于备份；在另一台设备或浏览器导入即可迁移全部内容。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => void handleExport()}>导出数据</Button>
            <Button variant="ghost" onClick={() => importRef.current?.click()}>
              导入数据
            </Button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportPick}
          />
        </section>

        {/* Storage */}
        <section className="rounded-sm border border-line bg-ground-2/20 p-6">
          <h2 className="font-display text-lg text-ink">存储用量</h2>
          <p className="mt-2 text-sm text-ink-muted">
            本地存储约 5MB 上限，图片与简历占主要空间。
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between font-mono text-[11px] text-ink-faint">
              <span>{formatBytes(usage)}</span>
              <span>{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ground">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.max(2, percent)}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Danger zone */}
      <section className="mt-4 rounded-sm border border-danger/30 bg-danger/5 p-6">
        <h2 className="font-display text-lg text-ink">危险操作</h2>
        <p className="mt-2 text-sm text-ink-muted">
          重置将清空当前全部内容并恢复为默认示例数据，且不可撤销。
        </p>
        <Button variant="danger" className="mt-5" onClick={() => setResetOpen(true)}>
          重置为默认数据
        </Button>
      </section>

      {/* Import confirm */}
      <Modal
        open={importText !== null}
        onClose={() => setImportText(null)}
        title="确认导入"
      >
        <p className="text-sm text-ink-muted">
          导入将覆盖当前全部数据，确定继续？
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setImportText(null)}>
            取消
          </Button>
          <Button onClick={() => void applyImport()}>确认导入</Button>
        </div>
      </Modal>

      {/* Reset confirm */}
      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="确认重置"
      >
        <p className="text-sm text-ink-muted">
          此操作会清空你的个人信息、项目与简历并恢复默认示例。确定继续？
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => void applyReset()}>
            确认重置
          </Button>
        </div>
      </Modal>
    </div>
  );
}

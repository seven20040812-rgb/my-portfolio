import { useState } from "react";

import { api } from "@/api";
import type { Project } from "@/api/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ImageUploader } from "@/components/ImageUploader";
import { PageLoader } from "@/components/ui/PageLoader";

function splitTags(value: string): string[] {
  return value
    .split(/[,，、\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProjectEditor({
  initial,
  nextOrder,
  onClose,
}: {
  initial: Project | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const { reload } = useData();
  const toast = useToast();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [cover, setCover] = useState<string | null>(initial?.cover ?? null);
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [repoUrl, setRepoUrl] = useState(initial?.repoUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      toast("标题不能为空", "error");
      return;
    }
    setBusy(true);
    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      detail,
      cover,
      tags: splitTags(tags),
      repoUrl: repoUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      featured,
      order: initial?.order ?? nextOrder,
    };
    try {
      if (initial) await api.projects.update(initial.id, payload);
      else await api.projects.create(payload);
      await reload();
      toast(initial ? "项目已更新" : "项目已创建");
      onClose();
    } catch {
      toast("保存失败，请重试", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="标题" htmlFor="p-title">
          <input
            id="p-title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="技术栈标签" htmlFor="p-tags" hint="用逗号分隔">
          <input
            id="p-tags"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Field>
      </div>

      <Field label="摘要" htmlFor="p-summary" className="mt-4">
        <input
          id="p-summary"
          className={inputClass}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </Field>

      <Field label="详情" htmlFor="p-detail" className="mt-4" hint="段落用空行分隔">
        <textarea
          id="p-detail"
          className={inputClass + " min-h-[140px] resize-y"}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </Field>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="源码链接" htmlFor="p-repo">
          <input
            id="p-repo"
            className={inputClass}
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="在线地址" htmlFor="p-live">
          <input
            id="p-live"
            className={inputClass}
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            placeholder="https://"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="封面图">
          <ImageUploader value={cover} onChange={setCover} aspect="wide" />
        </Field>
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        设为精选（首页展示）
      </label>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          取消
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "保存中…" : initial ? "保存修改" : "创建项目"}
        </Button>
      </div>
    </form>
  );
}

export default function ProjectsManagePage() {
  const { projects, loading, reload } = useData();
  const toast = useToast();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  if (loading) return <PageLoader />;

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (project: Project) => {
    setEditing(project);
    setEditorOpen(true);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= projects.length) return;
    const ids = projects.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await api.projects.reorder(ids);
    await reload();
  };

  const toggleFeatured = async (project: Project) => {
    await api.projects.update(project.id, { featured: !project.featured });
    await reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await api.projects.remove(deleting.id);
    await reload();
    setDeleting(null);
    toast("项目已删除");
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">PROJECTS</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            项目管理
          </h1>
          <p className="mt-2 text-sm text-ink-muted">共 {projects.length} 个项目</p>
        </div>
        <Button onClick={openNew}>+ 新建项目</Button>
      </header>

      <div className="mt-8 space-y-3">
        {projects.length === 0 && (
          <div className="rounded-sm border border-dashed border-line p-10 text-center text-sm text-ink-muted">
            还没有项目，点击「新建项目」创建第一个。
          </div>
        )}

        {projects.map((project, index) => (
          <div
            key={project.id}
            className="flex flex-wrap items-center gap-4 rounded-sm border border-line bg-ground-2/20 p-3"
          >
            <div className="h-12 w-20 shrink-0 overflow-hidden rounded-sm border border-line bg-ground">
              {project.cover ? (
                <img
                  src={project.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center font-mono text-[9px] text-ink-faint">
                  IMG
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-base text-ink">
                  {project.title}
                </p>
                {project.featured && (
                  <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                    精选
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-ink-muted">
                {project.summary || "—"}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="上移"
                disabled={index === 0}
                onClick={() => void move(index, -1)}
                className="grid h-8 w-8 place-items-center rounded-sm border border-line text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="下移"
                disabled={index === projects.length - 1}
                onClick={() => void move(index, 1)}
                className="grid h-8 w-8 place-items-center rounded-sm border border-line text-ink-muted transition-colors hover:text-ink disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={project.featured ? "取消精选" : "设为精选"}
                onClick={() => void toggleFeatured(project)}
                className="grid h-8 w-8 place-items-center rounded-sm border border-line text-ink-muted transition-colors hover:text-accent"
              >
                {project.featured ? "★" : "☆"}
              </button>
              <Button
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => openEdit(project)}
              >
                编辑
              </Button>
              <Button
                variant="danger"
                className="px-3 py-1.5 text-xs"
                onClick={() => setDeleting(project)}
              >
                删除
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? "编辑项目" : "新建项目"}
      >
        {editorOpen && (
          <ProjectEditor
            key={editing?.id ?? "new"}
            initial={editing}
            nextOrder={projects.length}
            onClose={() => setEditorOpen(false)}
          />
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="确认删除"
      >
        <p className="text-sm text-ink-muted">
          确定删除「{deleting?.title}」？此操作不可撤销。
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            取消
          </Button>
          <Button variant="danger" onClick={() => void confirmDelete()}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}

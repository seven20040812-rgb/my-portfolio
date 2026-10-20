import { useState } from "react";

import { api } from "@/api";
import type { Profile, SocialLink } from "@/api/types";
import { useData } from "@/context/DataContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { ImageUploader } from "@/components/ImageUploader";
import { PageLoader } from "@/components/ui/PageLoader";

function splitTags(value: string): string[] {
  return value
    .split(/[,，、\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProfileForm({ profile }: { profile: Profile }) {
  const { reload } = useData();
  const toast = useToast();

  const [name, setName] = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState<string | null>(profile.avatar);
  const [location, setLocation] = useState(profile.location);
  const [email, setEmail] = useState(profile.email);
  const [availability, setAvailability] = useState(profile.availability);
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [socials, setSocials] = useState<SocialLink[]>(profile.socials);
  const [busy, setBusy] = useState(false);

  const updateSocial = (id: string, patch: Partial<SocialLink>) => {
    setSocials((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !title.trim()) {
      toast("姓名与一句话介绍不能为空", "error");
      return;
    }
    setBusy(true);
    try {
      await api.profile.update({
        name: name.trim(),
        title: title.trim(),
        bio,
        avatar,
        location: location.trim(),
        email: email.trim(),
        availability: availability.trim(),
        skills: splitTags(skills),
        socials: socials.filter((s) => s.platform.trim() && s.url.trim()),
      });
      await reload();
      toast("个人信息已保存");
    } catch {
      toast("保存失败，请重试", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">PROFILE</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink">
            个人资料
          </h1>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "保存中…" : "保存修改"}
        </Button>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="姓名" htmlFor="name">
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </Field>
            <Field label="职位 / 一句话介绍" htmlFor="title">
              <input
                id="title"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
              />
            </Field>
          </div>

          <Field label="自我介绍" htmlFor="bio" className="mt-5" hint="支持换行，段落用空行分隔">
            <textarea
              id="bio"
              className={inputClass + " min-h-[160px] resize-y"}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
            />
          </Field>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="所在城市" htmlFor="location">
              <input
                id="location"
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Field>
            <Field label="邮箱" htmlFor="email">
              <input
                id="email"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="可用状态" htmlFor="availability">
              <input
                id="availability"
                className={inputClass}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="如：可接受有限合作"
              />
            </Field>
            <Field label="技能标签" htmlFor="skills" hint="用逗号分隔">
              <input
                id="skills"
                className={inputClass}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </Field>
          </div>

          {/* Socials */}
          <div className="mt-8 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow">社交链接</p>
              <button
                type="button"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent hover:text-accent-dim"
                onClick={() =>
                  setSocials((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), platform: "", url: "" },
                  ])
                }
              >
                + 添加
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {socials.length === 0 && (
                <p className="text-xs text-ink-faint">还没有社交链接。</p>
              )}
              {socials.map((social) => (
                <div key={social.id} className="flex gap-2">
                  <input
                    className={inputClass + " max-w-[140px]"}
                    placeholder="平台"
                    value={social.platform}
                    onChange={(e) =>
                      updateSocial(social.id, { platform: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="https://…"
                    value={social.url}
                    onChange={(e) =>
                      updateSocial(social.id, { url: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    aria-label="删除该链接"
                    className="shrink-0 rounded-sm border border-line px-3 text-ink-muted hover:border-danger/50 hover:text-danger"
                    onClick={() =>
                      setSocials((prev) =>
                        prev.filter((s) => s.id !== social.id)
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="lg:col-span-4">
          <div className="rounded-sm border border-line bg-ground-2/20 p-5">
            <p className="eyebrow">头像</p>
            <div className="mt-4">
              <ImageUploader
                value={avatar}
                onChange={setAvatar}
                aspect="square"
                maxMB={2}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              方形图片效果最佳，会自动压缩至 512px 内。未上传时前台展示星环单字头像。
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function ProfileEditPage() {
  const { profile, loading } = useData();
  if (loading || !profile) return <PageLoader />;
  return <ProfileForm profile={profile} />;
}

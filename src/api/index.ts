import { storage } from "./storage";
import { seedProfile, seedProjects } from "./seed";
import type {
  Database,
  Profile,
  Project,
  ProjectInput,
  Resume,
} from "./types";

const DB_VERSION = 1;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin";

const PROFILE_KEY = "profile";
const PROJECTS_KEY = "projects";
const RESUME_KEY = "resume";
const AUTH_KEY = "auth";

function ensureSeed(): void {
  if (!storage.has(PROFILE_KEY)) storage.set(PROFILE_KEY, seedProfile);
  if (!storage.has(PROJECTS_KEY)) storage.set(PROJECTS_KEY, seedProjects);
  if (!storage.has(RESUME_KEY)) storage.set<Resume | null>(RESUME_KEY, null);
}

ensureSeed();

function readProjects(): Project[] {
  return storage
    .get<Project[]>(PROJECTS_KEY, seedProjects)
    .slice()
    .sort((a, b) => a.order - b.order);
}

function now(): string {
  return new Date().toISOString();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

export const api = {
  profile: {
    async get(): Promise<Profile> {
      return storage.get<Profile>(PROFILE_KEY, seedProfile);
    },
    async update(patch: Partial<Profile>): Promise<Profile> {
      const current = await api.profile.get();
      const updated: Profile = { ...current, ...patch, updatedAt: now() };
      storage.set(PROFILE_KEY, updated);
      return updated;
    },
    async updateAvatar(dataUrl: string | null): Promise<Profile> {
      return api.profile.update({ avatar: dataUrl });
    },
  },

  projects: {
    async list(): Promise<Project[]> {
      return readProjects();
    },
    async get(id: string): Promise<Project | null> {
      return readProjects().find((p) => p.id === id) ?? null;
    },
    async featured(): Promise<Project[]> {
      return readProjects().filter((p) => p.featured);
    },
    async create(input: ProjectInput): Promise<Project> {
      const all = readProjects();
      const project: Project = {
        ...input,
        id: crypto.randomUUID(),
        order: input.order ?? all.length,
        createdAt: now(),
        updatedAt: now(),
      };
      storage.set(PROJECTS_KEY, [...all, project]);
      return project;
    },
    async update(id: string, patch: Partial<ProjectInput>): Promise<Project> {
      const all = readProjects();
      const idx = all.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error("项目不存在");
      const updated: Project = { ...all[idx], ...patch, updatedAt: now() };
      all[idx] = updated;
      storage.set(PROJECTS_KEY, all);
      return updated;
    },
    async remove(id: string): Promise<void> {
      storage.set(PROJECTS_KEY, readProjects().filter((p) => p.id !== id));
    },
    async reorder(orderedIds: string[]): Promise<Project[]> {
      const map = new Map(readProjects().map((p) => [p.id, p]));
      const next = orderedIds
        .map((id, i) => {
          const p = map.get(id);
          return p ? { ...p, order: i } : null;
        })
        .filter((p): p is Project => p !== null);
      storage.set(PROJECTS_KEY, next);
      return next;
    },
  },

  resume: {
    async get(): Promise<Resume | null> {
      return storage.get<Resume | null>(RESUME_KEY, null);
    },
    async upload(file: File): Promise<Resume> {
      const dataUrl = await readAsDataUrl(file);
      const resume: Resume = {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
        uploadedAt: now(),
      };
      storage.set(RESUME_KEY, resume);
      return resume;
    },
    async remove(): Promise<void> {
      storage.set<Resume | null>(RESUME_KEY, null);
    },
  },

  auth: {
    async login(password: string): Promise<boolean> {
      if (password === ADMIN_PASSWORD) {
        storage.set(AUTH_KEY, { loggedIn: true, at: now() });
        return true;
      }
      return false;
    },
    async logout(): Promise<void> {
      storage.remove(AUTH_KEY);
    },
    async isAuthenticated(): Promise<boolean> {
      return storage.get<{ loggedIn: boolean } | null>(AUTH_KEY, null)?.loggedIn === true;
    },
  },

  db: {
    async export(): Promise<string> {
      const snapshot: Database = {
        version: DB_VERSION,
        profile: await api.profile.get(),
        projects: await api.projects.list(),
        resume: await api.resume.get(),
      };
      return JSON.stringify(snapshot, null, 2);
    },
    async import(json: string): Promise<void> {
      const parsed = JSON.parse(json) as Partial<Database>;
      if (!parsed.profile || !Array.isArray(parsed.projects)) {
        throw new Error("数据格式无效");
      }
      storage.set(PROFILE_KEY, parsed.profile);
      storage.set(PROJECTS_KEY, parsed.projects);
      storage.set<Resume | null>(RESUME_KEY, parsed.resume ?? null);
    },
    async reset(): Promise<void> {
      storage.set(PROFILE_KEY, seedProfile);
      storage.set(PROJECTS_KEY, seedProjects);
      storage.set<Resume | null>(RESUME_KEY, null);
    },
  },
};

export type { Profile, Project, ProjectInput, Resume, Database } from "./types";

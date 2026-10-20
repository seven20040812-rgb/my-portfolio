import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/api";
import type { Profile, Project, Resume } from "@/api/types";

interface DataState {
  profile: Profile | null;
  projects: Project[];
  resume: Resume | null;
  loading: boolean;
  reload: () => Promise<void>;
}

const DataContext = createContext<DataState | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [nextProfile, nextProjects, nextResume] = await Promise.all([
      api.profile.get(),
      api.projects.list(),
      api.resume.get(),
    ]);
    setProfile(nextProfile);
    setProjects(nextProjects);
    setResume(nextResume);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key.startsWith("portfolio:v1:")) void reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const value = useMemo<DataState>(
    () => ({ profile, projects, resume, loading, reload }),
    [profile, projects, resume, loading, reload]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData 必须在 DataProvider 内使用");
  return ctx;
}

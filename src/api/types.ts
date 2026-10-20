export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatar: string | null;
  location: string;
  email: string;
  skills: string[];
  socials: SocialLink[];
  availability: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  detail: string;
  cover: string | null;
  tags: string[];
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;

export interface Resume {
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface Database {
  version: number;
  profile: Profile;
  projects: Project[];
  resume: Resume | null;
}

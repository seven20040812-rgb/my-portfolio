const NS = "portfolio:v1:";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(NS + key, JSON.stringify(value));
  },
  remove(key: string): void {
    localStorage.removeItem(NS + key);
  },
  has(key: string): boolean {
    return localStorage.getItem(NS + key) !== null;
  },
  keys(): string[] {
    return ["profile", "projects", "resume", "auth"];
  },
  clearAll(): void {
    for (const key of storage.keys()) storage.remove(key);
  },
};

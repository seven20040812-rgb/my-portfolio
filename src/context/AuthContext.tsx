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

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void api.auth.isAuthenticated().then((ok) => {
      if (alive) {
        setIsAuthenticated(ok);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (password: string) => {
    const ok = await api.auth.login(password);
    if (ok) setIsAuthenticated(true);
    return ok;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setIsAuthenticated(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ isAuthenticated, loading, login, logout }),
    [isAuthenticated, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}

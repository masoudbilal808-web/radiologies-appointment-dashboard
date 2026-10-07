"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as loginRequest } from "@/lib/api/auth";
import {
  clearSession,
  getSession,
  setSession,
  type SessionUser,
} from "@/lib/auth/session";
import { useRouter } from "@/i18n/navigation";

interface AuthContextValue {
  user: SessionUser | null;
  isReady: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const handle = requestAnimationFrame(() => {
      if (cancelled) return;
      const session = getSession();
      if (session) {
        setUser(session.user);
      }
      setIsReady(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(handle);
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await loginRequest(username, password);
      setSession({ token: data.token, user: data.user });
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, isReady, login, logout }),
    [user, isReady, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

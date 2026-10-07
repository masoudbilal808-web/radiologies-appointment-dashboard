const STORAGE_KEY = "rad_admin_session";

export interface SessionUser {
  id: string;
  username: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}

function isStorageAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function getSession(): AuthSession | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (!isStorageAvailable()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (!isStorageAvailable()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}

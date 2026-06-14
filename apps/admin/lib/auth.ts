import { apiFetch } from './api';

const TOKEN_KEY = 'questara_admin_token';
const USER_KEY = 'questara_admin_user';

export interface AdminUser {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  role: 'admin' | 'user';
  avatar_url?: string;
}

// Get JWT token from localStorage (client-side)
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Get stored user from localStorage
export function getStoredUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminUser;
  } catch {
    return null;
  }
}

// Save token and user to localStorage
export function saveSession(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Clear session
export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Also clear Supabase-related items if any
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.includes('supabase')) {
      localStorage.removeItem(key);
    }
  });
}

// Call /auth/me to verify token and get current user
export async function fetchCurrentUser(token: string): Promise<AdminUser | null> {
  try {
    const response = await apiFetch<{ ok: boolean; user: AdminUser }>(
      '/auth/me',
      { token }
    );
    if (response.ok && response.user) {
      return response.user;
    }
    return null;
  } catch {
    return null;
  }
}

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  const user = await fetchCurrentUser(token);
  return user?.role === 'admin';
}

// Get current session (token + user)
export async function getSession(): Promise<{ token: string; user: AdminUser } | null> {
  const token = getToken();
  if (!token) return null;

  const user = await fetchCurrentUser(token);
  if (!user) {
    clearSession();
    return null;
  }

  return { token, user };
}

// Logout
export async function logout(): Promise<void> {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

// Login with Supabase Auth (magic link or password)
export async function loginSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiFetch<{ ok: boolean; user?: AdminUser; error?: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.ok && response.user) {
      // For demo purposes, store a mock token
      const mockToken = `mock_token_${Date.now()}`;
      saveSession(mockToken, response.user);
      return { success: true };
    }

    return { success: false, error: response.error ?? 'Login failed' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, error: message };
  }
}
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  path: string,
  { token, headers: customHeaders, ...options }: FetchOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((error as { error?: string }).error ?? 'API request failed');
  }

  return response.json() as Promise<T>;
}

// Build query string for pagination
export function buildPaginationParams(limit: number, offset: number): string {
  return `?limit=${limit}&offset=${offset}`;
}

// API response types
export interface PaginatedResponse<T> {
  ok: boolean;
  total: number;
  limit: number;
  offset: number;
  [key: string]: unknown;
}

export interface SingleResponse<T> {
  ok: boolean;
  [key: string]: unknown;
}
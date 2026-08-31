import { ApiResponse, PaginatedApiResponse, TokenPair } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "bachnest_access_token";
const REFRESH_TOKEN_KEY = "bachnest_refresh_token";

export function getAccessToken() {
  return typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
}

export function saveTokens(tokens: TokenPair) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function buildUrl(endpoint: string) {
  return `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
}

function authHeaders(json: boolean) {
  const token = getAccessToken();
  const headers = new Headers();
  if (json) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const body = await res.json();
    if (body.success && body.data?.access_token) {
      saveTokens(body.data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

function refreshOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function toError<T>(message: string, code: string): ApiResponse<T> {
  return {
    success: false,
    message,
    data: null as T,
    error: { code, message },
  };
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<ApiResponse<T>> {
  const skipRefresh = endpoint.startsWith("/auth/");
  const token = getAccessToken();

  try {
    const res = await fetch(buildUrl(endpoint), {
      ...options,
      headers: authHeaders(true),
      cache: options.cache || "no-store",
    });

    if (res.status === 401 && token && !skipRefresh && !isRetry) {
      const refreshed = await refreshOnce();
      if (refreshed) {
        return fetchApi<T>(endpoint, options, true);
      }
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return toError<T>("Session expired. Please sign in again.", "SESSION_EXPIRED");
    }

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Request failed",
        data: null as T,
        error: data.error || { code: "HTTP_ERROR", message: res.statusText },
      };
    }
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return toError<T>(
      message.includes("fetch") ? "Network error. Make sure the backend server is running." : message,
      "NETWORK_ERROR"
    );
  }
}

export async function fetchPaginated<T>(endpoint: string): Promise<PaginatedApiResponse<T>> {
  try {
    const res = await fetch(buildUrl(endpoint), {
      headers: authHeaders(true),
      cache: "no-store",
    });
    if (!res.ok) {
      return { success: false, items: [], meta: { page: 1, limit: 20, total: 0, total_pages: 0 } };
    }
    return await res.json();
  } catch {
    return { success: false, items: [], meta: { page: 1, limit: 20, total: 0, total_pages: 0 } };
  }
}

export async function uploadFile(
  file: File,
  folder: string
): Promise<ApiResponse<{ file_url: string; filename?: string }>> {
  const form = new FormData();
  form.append("file", file);

  try {
    const res = await fetch(buildUrl(`/properties/upload-media?folder=${encodeURIComponent(folder)}`), {
      method: "POST",
      headers: authHeaders(false),
      body: form,
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Upload failed",
        data: null as unknown as { file_url: string; filename?: string },
        error: data.error || { code: "HTTP_ERROR", message: res.statusText },
      };
    }
    return data;
  } catch {
    return toError<{ file_url: string; filename?: string }>("Upload failed. Check your connection.", "NETWORK_ERROR");
  }
}

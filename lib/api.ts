import { ApiResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("bachnest_access_token") : null;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      cache: options.cache || "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Request failed",
        data: null as any,
        error: data.error || { code: "HTTP_ERROR", message: res.statusText },
      };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Network error. Make sure the backend server is running.",
      data: null as any,
      error: { code: "NETWORK_ERROR", message: err.message },
    };
  }
}

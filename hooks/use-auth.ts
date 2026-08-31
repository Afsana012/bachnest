"use client";

import { useEffect, useState } from "react";
import { User } from "@/lib/types";
import { clearTokens, fetchApi, getAccessToken } from "@/lib/api";

const USER_CACHE_KEY = "bachnest_user";

let cachedUser: User | null = null;
let inflight: Promise<User | null> | null = null;

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    return;
  }
}

function fetchCurrentUser(): Promise<User | null> {
  if (cachedUser) return Promise.resolve(cachedUser);
  if (!inflight) {
    inflight = (async () => {
      if (!getAccessToken()) return null;
      const res = await fetchApi<User>("/users/me");
      if (res.success && res.data) {
        cachedUser = res.data;
        writeCachedUser(res.data);
        return res.data;
      }
      clearTokens();
      writeCachedUser(null);
      return null;
    })().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

export async function refreshUser(): Promise<User | null> {
  cachedUser = null;
  writeCachedUser(null);
  return fetchCurrentUser();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }

      const cached = readCachedUser();
      if (cached) {
        setUser(cached);
        setLoading(false);
      }

      const fresh = await fetchCurrentUser();
      setUser(fresh);
      setLoading(false);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const logout = async () => {
    await fetchApi("/auth/logout", { method: "POST" });
    clearTokens();
    cachedUser = null;
    writeCachedUser(null);
    window.location.href = "/auth/login";
  };

  return { user, loading, logout, isAuthenticated: !!user };
}

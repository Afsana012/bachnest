"use client";

import { useEffect, useState } from "react";
import { User } from "@/lib/types";
import { fetchApi } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("bachnest_access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetchApi<User>("/users/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem("bachnest_access_token");
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("bachnest_access_token");
    localStorage.removeItem("bachnest_refresh_token");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return { user, loading, logout, isAuthenticated: !!user };
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, User, Phone, Mail, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "bachelor";

  const [role, setRole] = useState<"bachelor" | "property_owner">(
    defaultRole === "property_owner" ? "property_owner" : "bachelor"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetchApi<{ access_token: string; refresh_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        password,
        role,
      }),
    });

    setLoading(false);
    if (res.success && res.data) {
      localStorage.setItem("bachnest_access_token", res.data.access_token);
      localStorage.setItem("bachnest_refresh_token", res.data.refresh_token);
      router.push("/dashboard");
    } else {
      setError(res.message || "Registration failed. Please verify your details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-md rounded-3xl border-border/80 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
        <CardHeader className="p-0 text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mx-auto mb-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <span>BachNest</span>
          </Link>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join Bangladesh&apos;s verified rental platform</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-muted/50 mb-6">
            <button
              type="button"
              onClick={() => setRole("bachelor")}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                role === "bachelor" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              I&apos;m a Bachelor
            </button>
            <button
              type="button"
              onClick={() => setRole("property_owner")}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                role === "property_owner" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Property Owner
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input placeholder="017XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input type="email" placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold shadow-md mt-2">
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

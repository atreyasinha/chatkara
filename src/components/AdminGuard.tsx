"use client";

import { useEffect, useState } from "react";
import { Lock, AlertCircle, RefreshCw } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { EnvBanner } from "@/components/EnvBanner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/session", { credentials: "include" });
        if (!cancelled) setIsAuthenticated(res.ok);
      } catch {
        if (!cancelled) setIsAuthenticated(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.removeItem("chatkara_admin_token");
        setIsAuthenticated(true);
      } else {
        setError(data.error || "Incorrect password");
      }
    } catch {
      setError("Server connection failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", {
      method: "DELETE",
      credentials: "include",
    });
    setIsAuthenticated(false);
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <RefreshCw className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <EnvBanner />
        <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.18), transparent 45%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-line bg-bg-elevated/60 p-8 backdrop-blur-md text-center animate-fade-up">
          <BrandMark size="md" href="/" />

          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold ring-8 ring-gold/5">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="font-display mt-4 text-2xl text-gold">Admin Access</h1>
          <p className="mt-1.5 text-xs text-muted">
            Enter staff or administrator password to proceed.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="staff-password" className="sr-only">
                Staff or administrator password
              </label>
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "staff-login-error" : undefined}
                required
                className="w-full rounded-xl border border-line bg-bg-soft px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus:border-gold"
              />
            </div>

            {error && (
              <div id="staff-login-error" role="alert" className="flex items-center gap-1.5 justify-center text-xs text-nonveg">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flame-bg flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <EnvBanner />
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center rounded-full border border-line bg-bg-elevated/90 px-4 py-2 text-[11px] text-muted backdrop-blur hover:border-gold hover:text-gold"
        >
          Log out
        </button>
      </div>
      {children}
    </>
  );
}

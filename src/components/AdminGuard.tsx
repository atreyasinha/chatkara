"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, AlertCircle, RefreshCw, ShieldAlert, LogOut } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { EnvBanner } from "@/components/EnvBanner";

export function AdminGuard({
  children,
  requiredRole = "admin",
}: {
  children: React.ReactNode;
  requiredRole?: "admin" | "waiter";
}) {
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "waiter" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/admin/session", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          if (res.ok && data.authenticated) {
            setIsAuthenticated(true);
            setUserRole(data.role || "admin");
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
          setUserRole(null);
        }
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
        setUserRole(data.role || "admin");
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
    setUserRole(null);
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

            <h2 className="font-display mt-4 text-2xl text-gold">Admin Access</h2>
            <p className="mt-1.5 text-xs text-muted">
              Enter staff or administrator password to proceed.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-line bg-bg-soft px-4 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-gold"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 justify-center text-xs text-nonveg">
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

  // Check if current role has permission for this view
  const isDenied = requiredRole === "admin" && userRole === "waiter";

  if (isDenied) {
    return (
      <>
        <EnvBanner />
        <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4 text-center">
          <div className="w-full max-w-md rounded-3xl border border-line bg-bg-elevated/80 p-8 backdrop-blur-md shadow-xl animate-fade-up">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nonveg/15 text-nonveg ring-8 ring-nonveg/5">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="font-display mt-4 text-2xl font-bold text-gold">
              Administrator Only
            </h2>
            <p className="mt-2 text-sm text-muted">
              You are logged in with <strong className="text-ink font-semibold">Waiter Access</strong>. This owner view (analytics & configuration) is restricted to Administrators.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/admin/waiter"
                className="flame-bg w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110"
              >
                Go to Waiter Order POS →
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-line bg-bg-soft py-2.5 text-xs text-muted hover:text-ink"
              >
                Log out & use Admin password
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <EnvBanner />
      <div className="fixed top-3.5 right-3.5 z-40">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-elevated/90 px-3 py-1.5 text-xs text-muted backdrop-blur-md shadow-md hover:border-gold hover:text-gold active:scale-95 transition"
          title="Log out of session"
        >
          <LogOut className="h-3.5 w-3.5 text-gold" />
          <span>
            Log out{" "}
            <span className="text-[10px] opacity-75">
              ({userRole === "waiter" ? "Waiter" : "Admin"})
            </span>
          </span>
        </button>
      </div>
      {children}
    </>
  );
}

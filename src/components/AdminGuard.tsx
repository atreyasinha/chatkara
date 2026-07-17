"use client";

import { useEffect, useState } from "react";
import { Lock, AlertCircle, RefreshCw } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("chatkara_admin_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(token === "authenticated");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("chatkara_admin_token", "authenticated");
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

  // Prevent flash of login screen during check
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <RefreshCw className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4">
        {/* Premium ambient backdrop gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.18), transparent 45%)",
          }}
        />

        <div className="relative z-10 w-full max-w-sm rounded-3xl border border-line bg-bg-elevated/60 p-8 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-center animate-fade-up">
          <BrandMark size="md" href="/" />

          <div className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold ring-8 ring-gold/5">
            <Lock className="h-5 w-5" />
          </div>

          <h2 className="font-display mt-4 text-2xl text-gold">Admin Access</h2>
          <p className="mt-1.5 text-xs text-muted">
            Please enter your administrator password to view this page.
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
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";

/**
 * Shows a non-production banner so kitchen staff never confuse
 * the development database with live orders.
 */
export function EnvBanner() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg: { environment?: string; projectId?: string }) => {
        if (cancelled) return;
        if (cfg.environment && cfg.environment !== "production") {
          const project = cfg.projectId ? ` · ${cfg.projectId}` : "";
          setLabel(`Development${project}`);
        }
      })
      .catch(() => {
        /* ignore — banner is best-effort */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-widest text-amber-200"
    >
      {label} — not live orders
    </div>
  );
}

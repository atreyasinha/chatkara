"use client";

import { useEffect } from "react";

/** Registers the kitchen service worker once on the kitchen tablet. */
export function KitchenPwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore — optional offline shell */
    });
  }, []);
  return null;
}

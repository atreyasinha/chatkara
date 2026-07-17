"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { BrandMark } from "@/components/BrandMark";
import { RESTAURANT } from "@/lib/restaurant";

export function QrCodesClient() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const tables = Array.from(
    { length: RESTAURANT.tableCount },
    (_, i) => i + 1,
  );

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 py-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          header, button, link, a {
            display: none !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10mm !important;
          }
          .print-card {
            border: 2px solid #ccc !important;
            border-radius: 15px !important;
            padding: 15px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            height: 125mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .print-card:nth-child(4n) {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}} />
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <BrandMark size="md" href="/" />
        <div className="flex gap-2">
          <Link
            href="/kitchen"
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-gold hover:text-gold"
          >
            Kitchen POS
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="flame-bg rounded-full px-4 py-1.5 text-xs font-semibold text-white"
          >
            Print all
          </button>
        </div>
      </header>

      <div className="mb-6">
        <h1 className="font-display text-3xl text-gold">Table QR codes</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Print and place one QR at each table. Guests scan to open the menu and
          place orders. Make sure this site is hosted on a public URL so phones
          can reach it.
        </p>
      </div>

      {!origin ? (
        <p className="text-muted">Preparing QR codes…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-2 print-grid">
          {tables.map((n) => {
            const url = `${origin}/table/${n}?token=${RESTAURANT.tableTokens[n]}`;
            return (
              <div
                key={n}
                className="print-card flex flex-col items-center rounded-3xl border border-line bg-bg-elevated p-5 print:break-inside-avoid print:border-black print:bg-white print:text-black"
              >
                <p className="font-display text-2xl text-gold print:text-black">
                  Table {n}
                </p>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-muted print:text-neutral-600">
                  {RESTAURANT.name}
                </p>
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG value={url} size={160} level="M" />
                </div>
                <p className="mt-4 text-xs font-semibold tracking-widest uppercase text-gold print:text-neutral-800">
                  Scan to order
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

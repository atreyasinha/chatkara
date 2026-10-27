"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatINR, RESTAURANT } from "@/lib/restaurant";
import { orderRef, orderTypeLabel } from "@/lib/receipt";
import type { Order } from "@/lib/types";

/** "bill" = customer receipt with prices; "kot" = kitchen order ticket, no prices. */
export type PrintKind = "bill" | "kot";

type PrintJob = { order: Order; kind: PrintKind };

/**
 * Renders a receipt-sized slip into <body> and opens the browser print dialog.
 * globals.css hides everything else while a `.print-root` is present, so
 * thermal (80mm) and A4 printers both get just the slip.
 */
export function usePrintSlip() {
  const [job, setJob] = useState<PrintJob | null>(null);

  useEffect(() => {
    if (!job) return;
    function done() {
      setJob(null);
    }
    window.addEventListener("afterprint", done);
    // Wait a frame so the portal is painted before the dialog snapshots the page.
    const raf = requestAnimationFrame(() => window.print());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("afterprint", done);
    };
  }, [job]);

  const print = useCallback((order: Order, kind: PrintKind) => {
    setJob({ order, kind });
  }, []);

  const slip = job
    ? createPortal(
        <div className="print-root" aria-hidden="true">
          {job.kind === "kot" ? (
            <KitchenTicket order={job.order} />
          ) : (
            <Bill order={job.order} />
          )}
        </div>,
        document.body,
      )
    : null;

  return { print, slip };
}

function formatStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function Rule() {
  return <div className="print-rule" />;
}

function Bill({ order }: { order: Order }) {
  const subtotal = Math.round(order.subtotal || order.total || 0);
  const gst = Math.round(order.gst || 0);
  return (
    <div>
      <div className="text-center">
        <p className="print-title">{RESTAURANT.name}</p>
        <p>{RESTAURANT.tagline}</p>
        <p>
          {RESTAURANT.location.city}, {RESTAURANT.location.state}
        </p>
        <p>Ph: {RESTAURANT.phone}</p>
      </div>
      <Rule />
      <Row left={`Bill #${orderRef(order)}`} right={orderTypeLabel(order)} />
      <p>{formatStamp(order.createdAt)}</p>
      {order.customerName && <p>Customer: {order.customerName}</p>}
      <Rule />
      <table className="print-table">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={`${item.itemId}-${idx}`}>
              <td className="text-left">
                {item.name}
                <br />
                <span className="print-muted">@ {formatINR(item.price)}</span>
              </td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">
                {formatINR(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Rule />
      <Row left="Subtotal" right={formatINR(subtotal)} />
      {order.discountAmount ? (
        <Row
          left={`Discount (${order.discountPercent}%)`}
          right={`-${formatINR(Math.round(order.discountAmount))}`}
        />
      ) : null}
      {gst > 0 && <Row left="GST" right={formatINR(gst)} />}
      <div className="print-total">
        <Row left="TOTAL" right={formatINR(Math.round(order.total))} />
      </div>
      <Rule />
      <Row
        left={order.paymentMethod === "upi" ? "UPI" : "Cash"}
        right={order.paymentStatus === "paid" ? "PAID" : "DUE"}
      />
      <Rule />
      <p className="text-center">Thank you for dining with us!</p>
    </div>
  );
}

function KitchenTicket({ order }: { order: Order }) {
  return (
    <div>
      <p className="text-center print-title">KOT</p>
      <p className="text-center print-big">{orderTypeLabel(order)}</p>
      <Row left={`#${orderRef(order)}`} right={formatStamp(order.createdAt)} />
      {order.customerName && <p>{order.customerName}</p>}
      {order.needsKitchenAck && <p className="print-strong">** ITEMS ADDED **</p>}
      <Rule />
      <table className="print-table">
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={`${item.itemId}-${idx}`}>
              <td className="print-qty">{item.quantity} ×</td>
              <td className="text-left">
                {item.name}
                {item.notes && (
                  <>
                    <br />
                    <span className="print-muted">↳ {item.notes}</span>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {order.notes && (
        <>
          <Rule />
          <p className="print-strong">Note: {order.notes}</p>
        </>
      )}
      <Rule />
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{left}</span>
      <span className="text-right">{right}</span>
    </div>
  );
}

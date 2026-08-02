import type { Order } from "./types";

/**
 * Formats a WhatsApp-ready bill receipt for a given order.
 * Uses WhatsApp markdown: *bold*, no HTML.
 * Shared between OrderTracker (customer self-share) and KitchenDashboard (staff share).
 */
export function formatWhatsAppReceipt(order: Order): string {
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.name} (x${item.quantity}) — ₹${item.price * item.quantity}`,
    )
    .join("\n");

  const orderType =
    order.tableNumber === 0 ? "Online Pickup" : `Table ${order.tableNumber}`;

  const formattedId = order.id.slice(0, 8).toUpperCase();

  let discountLines = "";
  if (order.discountAmount) {
    discountLines = `*Discount (${order.discountPercent}%):* -₹${Math.round(order.discountAmount)}\n`;
  }

  const subtotal = Math.round(order.subtotal || order.total || 0);
  const gst = Math.round(order.gst || 0);
  const total = Math.round(order.total);
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    `🌟 *CHATKARA BILL RECEIPT* 🌟\n\n` +
    `*Order Reference:* #${formattedId}\n` +
    `*Type:* ${orderType}\n` +
    `*Time:* ${time}\n` +
    `----------------------------\n` +
    `${itemsText}\n` +
    `----------------------------\n` +
    `*Subtotal:* ₹${subtotal}\n` +
    discountLines +
    // GST is off (registration pending); legacy orders with gst > 0 show the
    // amount without a stale percent from the current config.
    (gst > 0 ? `*GST:* ₹${gst}\n` : "") +
    `*Total Amount:* ₹${total}\n\n` +
    `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n` +
    `*Payment Status:* ${order.paymentStatus === "paid" ? "PAID" : "DUE"}\n\n` +
    `*Thank you for ordering with us at ChatKara!*`
  );
}

/** Opens WhatsApp with the bill receipt pre-filled for sharing. */
export function shareReceiptOnWhatsApp(order: Order, phone?: string): void {
  const text = formatWhatsAppReceipt(order);
  // wa.me requires a full international number — stored phones are 10-digit Indian mobiles.
  const digits = phone?.replace(/\D/g, "");
  const fullPhone =
    digits && digits.length === 10
      ? `91${digits}`
      : digits && digits.length > 10
        ? digits
        : undefined;
  const url = fullPhone
    ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

import type { Order } from "./types";
import { RESTAURANT } from "./restaurant";

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
    `*GST (${RESTAURANT.gstPercent}%):* ₹${gst}\n` +
    `*Total Amount:* ₹${total}\n\n` +
    `*Payment Method:* ${order.paymentMethod.toUpperCase()}\n` +
    `*Payment Status:* ${order.paymentStatus === "paid" ? "PAID" : "DUE"}\n\n` +
    `*Thank you for ordering with us at ChatKara!*`
  );
}

/** Opens WhatsApp with the bill receipt pre-filled for sharing. */
export function shareReceiptOnWhatsApp(order: Order, phone?: string): void {
  const text = formatWhatsAppReceipt(order);
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

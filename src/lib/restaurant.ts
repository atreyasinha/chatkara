export const RESTAURANT = {
  name: "ChatKara",
  tagline: "Flavours of India",
  location: {
    lat: 23.619147660495543,
    lng: 86.18070429732468,
    city: "Bokaro",
    state: "Jharkhand",
    country: "India",
    mapsUrl:
      "https://www.google.com/maps?q=23.619147660495543,86.18070429732468",
  },
  /** Replace with your real UPI ID before going live */
  upiId: "chatkara@upi",
  upiPayeeName: "ChatKara",
  gstPercent: 5,
  tableCount: 20,
  currency: "INR" as const,
  currencySymbol: "₹",
};

export function formatINR(amount: number): string {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
}

export function buildUpiLink(amount: number, orderId: string): string {
  const params = new URLSearchParams({
    pa: RESTAURANT.upiId,
    pn: RESTAURANT.upiPayeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `ChatKara Order ${orderId.slice(0, 8).toUpperCase()}`,
  });
  return `upi://pay?${params.toString()}`;
}

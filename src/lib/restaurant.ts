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
  upiId: "gayatrisinha.ibz@icici",
  upiPayeeName: "ChatKara",
  gstPercent: 5,
  tableCount: 7,
  currency: "INR" as const,
  currencySymbol: "₹",
  tableTokens: {
    1: "ck_t1_x92a",
    2: "ck_t2_p83b",
    3: "ck_t3_m17c",
    4: "ck_t4_y64d",
    5: "ck_t5_r28e",
    6: "ck_t6_v59f",
    7: "ck_t7_w41g",
  } as Record<number, string>,
};

export function formatINR(amount: number): string {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
}

export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
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

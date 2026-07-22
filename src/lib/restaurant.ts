export const RESTAURANT = {
  name: "ChatKara",
  tagline: "Flavours of India",
  /** Contact number displayed publicly and in schema.org structured data. */
  phone: "+919608001786",
  location: {
    lat: 23.6191121,
    lng: 86.1806551,
    city: "Bokaro",
    state: "Jharkhand",
    country: "India",
    mapsUrl:
      "https://www.google.com/maps/place/ChatKara+Restaurant/@23.6191121,86.1806551,17z/data=!3m1!4b1!4m6!3m5!1s0x39f427aa61c3395b:0x51a9c1a40977e0b3!8m2!3d23.6191121!4d86.1806551!16s%2Fg%2F11nr7vtt8w",
    mapsEmbedUrl: "https://maps.google.com/maps?cid=5884447298413912243&z=16&output=embed",
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

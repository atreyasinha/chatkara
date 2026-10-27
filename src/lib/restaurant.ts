export const RESTAURANT = {
  name: "ChatKara",
  tagline: "Flavours of India",
  phone: "+919431911929",
  whatsapp: "+919431911929",
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
  /** Set to 0 while GST registration is pending; totals = subtotal − discount. */
  gstPercent: 0,
  tableCount: 7,
  currency: "INR" as const,
  currencySymbol: "₹",
  developer: "Shriumasha Enterprises Private Limited",
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

export type UpiApp = "generic" | "gpay" | "phonepe" | "paytm" | "bhim";
export type UpiPlatform = "android" | "ios" | "other";

/** Android package ids — Chrome only opens a specific app via intent:// + package. */
const UPI_ANDROID_PACKAGES: Record<Exclude<UpiApp, "generic">, string> = {
  gpay: "com.google.android.apps.nbu.paisa.user",
  phonepe: "com.phonepe.app",
  paytm: "net.one97.paytm",
  bhim: "in.org.npci.upiapp",
};

/**
 * iOS has no system handler for upi://, so each app must be opened by its own
 * scheme. gpay:// is from Google's iOS docs; BHIM has no documented scheme.
 */
const UPI_IOS_PREFIXES: Partial<Record<UpiApp, string>> = {
  gpay: "gpay://upi/pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
};

function upiQuery(amount: number, orderId: string): string {
  return new URLSearchParams({
    pa: RESTAURANT.upiId,
    pn: RESTAURANT.upiPayeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `ChatKara Order ${orderId.slice(0, 8).toUpperCase()}`,
  }).toString();
}

/** Standard NPCI link — used for the QR code and the Android "any UPI app" chooser. */
export function buildUpiLink(amount: number, orderId: string): string {
  return `upi://pay?${upiQuery(amount, orderId)}`;
}

/**
 * Link that opens a specific UPI app on the given platform, or null when that
 * combination can't work (desktop, BHIM / generic on iOS) so the UI can hide it.
 */
export function buildUpiAppLink(
  amount: number,
  orderId: string,
  app: UpiApp,
  platform: UpiPlatform,
): string | null {
  const query = upiQuery(amount, orderId);
  if (platform === "android") {
    if (app === "generic") return `upi://pay?${query}`;
    return `intent://pay?${query}#Intent;scheme=upi;package=${UPI_ANDROID_PACKAGES[app]};end`;
  }
  if (platform === "ios") {
    const prefix = UPI_IOS_PREFIXES[app];
    return prefix ? `${prefix}?${query}` : null;
  }
  return null;
}

export function detectUpiPlatform(userAgent: string, maxTouchPoints = 0): UpiPlatform {
  if (/Android/i.test(userAgent)) return "android";
  // iPadOS 13+ reports itself as a Mac; touch support gives it away.
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return "ios";
  return "other";
}

/** Social-app webviews (Instagram, Facebook, …) block custom-scheme navigation. */
export function isInAppBrowser(userAgent: string): boolean {
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|Snapchat/i.test(userAgent);
}

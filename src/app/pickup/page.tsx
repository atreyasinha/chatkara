import type { Metadata } from "next";
import { TableOrderClient } from "@/components/TableOrderClient";

export const metadata: Metadata = {
  title: "Online Pickup Menu | ChatKara Bokaro",
  description:
    "Order online for quick pickup from ChatKara at Bokaro, Jharkhand. Browse our premium menu of street food, chaat, desserts, and Indian classics.",
  alternates: {
    canonical: "https://chatkara.lagardenia.in/pickup",
  },
  keywords: [
    "ChatKara Menu",
    "Online Food Order Bokaro",
    "Pickup Menu Bokaro",
    "Chaat Pickup Bokaro",
    "Indian Food Delivery Bokaro",
  ],
  openGraph: {
    title: "Online Pickup Menu | ChatKara Bokaro",
    description:
      "Order online for quick pickup from ChatKara at Bokaro, Jharkhand. Browse our premium menu of street food, chaat, desserts, and Indian classics.",
    url: "https://chatkara.lagardenia.in/pickup",
    siteName: "ChatKara",
    type: "website",
  },
};

export default function PickupPage() {
  return <TableOrderClient tableNumber={0} />;
}

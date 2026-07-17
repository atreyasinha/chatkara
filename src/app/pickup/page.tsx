import type { Metadata } from "next";
import { TableOrderClient } from "@/components/TableOrderClient";

export const metadata: Metadata = {
  title: "Online Pickup Menu | ChatKara Bokaro",
  description:
    "Order online for quick pickup from ChatKara at Bokaro, Jharkhand. Browse our premium menu of street food, chaat, desserts, and Indian classics.",
};

export default function PickupPage() {
  return <TableOrderClient tableNumber={0} />;
}

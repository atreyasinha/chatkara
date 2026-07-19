import { KitchenDashboard } from "@/components/KitchenDashboard";
import { AdminGuard } from "@/components/AdminGuard";
import { KitchenPwaRegister } from "@/components/KitchenPwaRegister";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kitchen POS — ChatKara",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ChatKara Kitchen",
    statusBarStyle: "black-translucent",
  },
};

export default function KitchenPage() {
  return (
    <AdminGuard>
      <KitchenPwaRegister />
      <KitchenDashboard />
    </AdminGuard>
  );
}

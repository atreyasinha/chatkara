import { WaiterOrderClient } from "@/components/WaiterOrderClient";
import { AdminGuard } from "@/components/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waiter Order — ChatKara",
};

export default function WaiterOrderPage() {
  return (
    <AdminGuard>
      <WaiterOrderClient />
    </AdminGuard>
  );
}

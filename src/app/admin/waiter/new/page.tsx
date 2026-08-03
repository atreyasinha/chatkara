import { WaiterOrderClient } from "@/components/WaiterOrderClient";
import { AdminGuard } from "@/components/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Waiter Order — ChatKara",
};

export default function WaiterNewOrderPage() {
  return (
    <AdminGuard>
      <WaiterOrderClient />
    </AdminGuard>
  );
}

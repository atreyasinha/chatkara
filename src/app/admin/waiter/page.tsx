import { WaiterDashboard } from "@/components/WaiterDashboard";
import { AdminGuard } from "@/components/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waiter — ChatKara",
};

export default function WaiterPage() {
  return (
    <AdminGuard>
      <WaiterDashboard />
    </AdminGuard>
  );
}

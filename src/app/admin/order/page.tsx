import { ManagerOrderClient } from "@/components/ManagerOrderClient";
import { AdminGuard } from "@/components/AdminGuard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manager Order — ChatKara",
};

export default function ManagerOrderPage() {
  return (
    <AdminGuard>
      <ManagerOrderClient />
    </AdminGuard>
  );
}

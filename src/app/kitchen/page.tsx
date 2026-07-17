import { KitchenDashboard } from "@/components/KitchenDashboard";
import { AdminGuard } from "@/components/AdminGuard";

export default function KitchenPage() {
  return (
    <AdminGuard>
      <KitchenDashboard />
    </AdminGuard>
  );
}

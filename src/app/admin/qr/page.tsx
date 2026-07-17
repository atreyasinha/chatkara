import { QrCodesClient } from "@/components/QrCodesClient";
import { AdminGuard } from "@/components/AdminGuard";

export default function QrAdminPage() {
  return (
    <AdminGuard>
      <QrCodesClient />
    </AdminGuard>
  );
}

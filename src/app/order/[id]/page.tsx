import { OrderTracker } from "@/components/OrderTracker";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderTracker orderId={id} />;
}

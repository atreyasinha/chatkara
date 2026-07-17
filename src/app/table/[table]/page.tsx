import { notFound } from "next/navigation";
import { TableOrderClient } from "@/components/TableOrderClient";
import { RESTAURANT } from "@/lib/restaurant";

export function generateStaticParams() {
  return Array.from({ length: RESTAURANT.tableCount }, (_, i) => ({
    table: String(i + 1),
  }));
}

export default async function TablePage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>;
  searchParams: Promise<{ parentOrderId?: string }>;
}) {
  const { table } = await params;
  const { parentOrderId } = await searchParams;
  const n = Number(table);
  if (!Number.isFinite(n) || n < 1 || n > RESTAURANT.tableCount) {
    notFound();
  }
  return <TableOrderClient tableNumber={n} parentOrderId={parentOrderId} />;
}

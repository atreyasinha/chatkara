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
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const n = Number(table);
  if (!Number.isFinite(n) || n < 1 || n > RESTAURANT.tableCount) {
    notFound();
  }
  return <TableOrderClient tableNumber={n} />;
}

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
  searchParams: Promise<{ parentOrderId?: string; token?: string }>;
}) {
  const { table } = await params;
  const { parentOrderId, token } = await searchParams;
  const n = Number(table);
  if (!Number.isFinite(n) || n < 1 || n > RESTAURANT.tableCount) {
    notFound();
  }

  // Token Verification for Anti-Spam protection
  const expectedToken = RESTAURANT.tableTokens[n];
  if (!expectedToken || token !== expectedToken) {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg px-4 py-8 text-center">
        {/* Premium ambient backdrop gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.18), transparent 45%)",
          }}
        />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-bg-elevated/60 p-8 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-nonveg/10 text-nonveg ring-8 ring-nonveg/5">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="font-display mt-5 text-2xl text-gold">Invalid Table Access</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Dine-in table ordering is restricted. To browse the menu and order, 
            please **scan the physical QR code** placed on your table.
          </p>

          <div className="mt-8 border-t border-line/45 pt-6">
            <a 
              href="/"
              className="flame-bg block w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              Go to Home Page
            </a>
          </div>
        </div>
      </main>
    );
  }

  return <TableOrderClient tableNumber={n} parentOrderId={parentOrderId} />;
}

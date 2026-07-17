import Image from "next/image";
import Link from "next/link";
import { MapPin, QrCode, UtensilsCrossed, Monitor } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";

export default function HomePage() {
  const tables = Array.from({ length: RESTAURANT.tableCount }, (_, i) => i + 1);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* Premium ambient backdrop gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 70%, rgba(185,28,28,0.18), transparent 45%)",
        }}
      />

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">
          {RESTAURANT.location.city} · {RESTAURANT.location.state}
        </p>
        <div className="flex gap-4">
          <Link
            href="/kitchen"
            className="flex items-center gap-1.5 text-xs text-muted transition hover:text-gold"
          >
            <Monitor className="h-3 w-3" />
            Kitchen POS
          </Link>
          <Link
            href="/admin/qr"
            className="flex items-center gap-1.5 text-xs text-muted transition hover:text-gold"
          >
            <QrCode className="h-3 w-3" />
            Admin QRs
          </Link>
        </div>
      </nav>

      {/* Hero Welcome & Table Grid */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-4 text-center">
        <div className="animate-fade-up">
          <Image
            src="/logo.png"
            alt={`${RESTAURANT.name} — ${RESTAURANT.tagline}`}
            width={180}
            height={180}
            priority
            className="mx-auto rounded-full shadow-[0_0_60px_rgba(212,175,55,0.22)]"
          />
        </div>

        <h1 className="font-display mt-5 animate-fade-up text-5xl tracking-wide text-gold md:text-6xl" style={{ animationDelay: "80ms" }}>
          चट<span className="flame-text">Kara</span>
        </h1>
        <p
          className="mt-1.5 animate-fade-up text-xs uppercase tracking-[0.35em] text-gold-soft"
          style={{ animationDelay: "140ms" }}
        >
          {RESTAURANT.tagline}
        </p>

        {/* Premium Card Container for Table Selection */}
        <div 
          className="mt-8 w-full max-w-sm rounded-3xl border border-line bg-bg-elevated/60 p-6 backdrop-blur-md animate-fade-up shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
          style={{ animationDelay: "220ms" }}
        >
          <h2 className="font-display text-lg text-gold flex items-center justify-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-gold-soft" />
            Select Your Table
          </h2>
          <p className="mb-5 mt-1 text-xs text-muted">
            Tap your table number to browse menu & order
          </p>

          <div className="grid grid-cols-4 gap-3">
            {tables.map((n) => (
              <Link
                key={n}
                href={`/table/${n}`}
                className="flex h-12 items-center justify-center rounded-xl border border-line bg-bg-soft font-display text-base font-bold text-gold transition hover:border-gold hover:bg-gold-dim active:scale-[0.96]"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Location info */}
        <a
          href={RESTAURANT.location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 text-xs text-muted transition hover:text-gold animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          <MapPin className="h-3.5 w-3.5 text-gold-soft" />
          Visit us: {RESTAURANT.location.city}, {RESTAURANT.location.state}
        </a>
      </section>
    </main>
  );
}

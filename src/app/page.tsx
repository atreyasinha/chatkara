import Image from "next/image";
import Link from "next/link";
import { MapPin, QrCode, UtensilsCrossed } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(185,28,28,0.18), transparent 45%)",
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">
          Bokaro · Jharkhand
        </p>
        <div className="flex gap-3">
          <Link
            href="/kitchen"
            className="text-xs text-muted transition hover:text-gold"
          >
            Kitchen
          </Link>
          <Link
            href="/admin/qr"
            className="text-xs text-muted transition hover:text-gold"
          >
            QR codes
          </Link>
        </div>
      </nav>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 text-center">
        <div className="animate-fade-up">
          <Image
            src="/logo.png"
            alt="ChatKara — Flavours of India"
            width={220}
            height={220}
            priority
            className="mx-auto rounded-full shadow-[0_0_60px_rgba(212,175,55,0.25)]"
          />
        </div>

        <h1 className="font-display mt-6 animate-fade-up text-5xl tracking-wide text-gold md:text-6xl" style={{ animationDelay: "80ms" }}>
          चट<span className="flame-text">Kara</span>
        </h1>
        <p
          className="mt-2 animate-fade-up text-sm uppercase tracking-[0.35em] text-gold-soft"
          style={{ animationDelay: "140ms" }}
        >
          Flavours of India
        </p>
        <p
          className="mt-5 max-w-md animate-fade-up text-base text-muted"
          style={{ animationDelay: "200ms" }}
        >
          Scan the QR on your table to browse the menu and order — pay with UPI
          or cash.
        </p>

        <div
          className="mt-8 flex w-full max-w-sm flex-col gap-3 animate-fade-up sm:flex-row"
          style={{ animationDelay: "280ms" }}
        >
          <Link
            href="/table/1"
            className="flame-bg flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold text-white transition hover:brightness-110"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Demo table 1
          </Link>
          <Link
            href="/admin/qr"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold/50 px-5 py-3.5 font-semibold text-gold transition hover:bg-gold-dim"
          >
            <QrCode className="h-4 w-4" />
            Print QR codes
          </Link>
        </div>

        <a
          href={RESTAURANT.location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-gold animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <MapPin className="h-4 w-4 text-gold" />
          {RESTAURANT.location.city}, {RESTAURANT.location.state}
        </a>
      </section>
    </main>
  );
}

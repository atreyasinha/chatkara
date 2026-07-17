import Image from "next/image";
import Link from "next/link";
import { MapPin, ShoppingBag, Monitor, Clock } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";

export default function HomePage() {
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
        <p className="font-betania text-2xl tracking-wide text-gold-soft/90">
          a La Gardenia concept
        </p>
      </nav>

      {/* Main Section */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-4 text-center">
        {/* Emblem Only */}
        <div className="animate-fade-up">
          <Image
            src="/logo.png"
            alt={RESTAURANT.name}
            width={240}
            height={240}
            priority
            className="mx-auto rounded-full shadow-[0_0_65px_rgba(212,175,55,0.25)]"
          />
        </div>

        {/* Order Pickup Button */}
        <div 
          className="mt-10 w-full flex justify-center animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          <Link
            href="/pickup"
            className="flame-bg flex w-full max-w-xs items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-white transition hover:brightness-110 shadow-lg shadow-flame-from/20 active:scale-[0.98]"
          >
            <ShoppingBag className="h-5 w-5" />
            Order Online Pickup
          </Link>
        </div>
      </section>

      {/* Professional Copy & Details Panel */}
      <section className="relative z-10 mx-auto w-full max-w-md border-t border-line bg-bg-elevated/40 px-6 py-8 backdrop-blur-md">
        {/* Culinary Note */}
        <div className="text-center">
          <h2 className="font-display text-2xl text-gold">Flavours of India</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Savor the rich heritage of slow-cooked gravies, authentic hand-ground spices, 
            and traditional clay-oven tandoors. Our recipes represent the culinary soul of 
            North India, crafted with passion.
          </p>
        </div>

        {/* Operating Hours */}
        <div className="mt-8 border-t border-line/50 pt-6">
          <div className="flex items-center gap-3 justify-center text-gold-soft">
            <Clock className="h-5 w-5" />
            <h3 className="font-display text-lg">Hours of Operation</h3>
          </div>
          <p className="mt-2 text-center text-sm text-muted">
            Open Daily: <span className="font-semibold text-ink">11:30 AM – 10:30 PM</span>
          </p>
        </div>

        {/* Location & Embedded Map */}
        <div className="mt-8 border-t border-line/50 pt-6">
          <div className="mb-4 flex items-center gap-2 justify-center text-gold-soft">
            <MapPin className="h-5 w-5" />
            <h3 className="font-display text-lg">Find Us</h3>
          </div>
          
          {/* Embedded Google Map */}
          <div className="overflow-hidden rounded-2xl border border-line bg-bg-soft">
            <iframe
              src={`https://maps.google.com/maps?q=${RESTAURANT.location.lat},${RESTAURANT.location.lng}&z=16&output=embed`}
              className="h-44 w-full opacity-80"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-3 text-center">
            <a
              href={RESTAURANT.location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-gold transition underline underline-offset-4"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Footer / POS Access */}
      <footer className="relative z-10 mx-auto w-full max-w-md py-6 text-center">
        <Link
          href="/kitchen"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted/40 transition hover:text-gold-soft"
        >
          <Monitor className="h-3 w-3" />
          Kitchen POS
        </Link>
      </footer>
    </main>
  );
}

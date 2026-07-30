import Image from "next/image";
import Link from "next/link";
import { MapPin, ShoppingBag, Monitor, Clock, Utensils } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: "ChatKara",
            description:
              "Authentic Indian Restaurant, Chaat & Tandoori in Bokaro Steel City. Order online for pickup or scan QR code for table service.",
            image: "https://chatkara.lagardenia.in/og-image.png",
            "@id": "https://chatkara.lagardenia.in",
            url: "https://chatkara.lagardenia.in",
            telephone: RESTAURANT.phone,
            priceRange: "₹₹",
            menu: "https://chatkara.lagardenia.in/pickup",
            hasMenu: "https://chatkara.lagardenia.in/pickup",
            servesCuisine:
              "Indian, North Indian, Street Food, Chaat, Tandoori, Desserts",
            acceptsReservations: "True",
            paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Paytm",
            currenciesAccepted: "INR",
            sameAs: [RESTAURANT.location.mapsUrl],
            parentOrganization: {
              "@type": "Organization",
              name: "La Gardenia",
              url: "https://lagardenia.in",
            },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bokaro Steel City",
              addressRegion: "Jharkhand",
              addressCountry: "IN",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: RESTAURANT.location.lat,
              longitude: RESTAURANT.location.lng,
            },
            openingHoursSpecification: {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              opens: "12:00",
              closes: "23:00",
            },
          }),
        }}
      />

      {/* Full-bleed hero — one composition */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/photo-tikka.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] animate-ken-burns"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-bg"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(0,0,0,0.45), transparent 65%), radial-gradient(ellipse 70% 45% at 50% 15%, rgba(212,175,55,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(185,28,28,0.22), transparent 50%)",
            }}
          />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
          <p className="font-betania text-lg tracking-wide text-gold-soft/90 md:text-xl">
            a La Gardenia concept
          </p>
          <a
            href={`https://wa.me/${RESTAURANT.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact on WhatsApp"
            title="Contact on WhatsApp"
            className="flex items-center gap-1.5 rounded-full border border-green-600/40 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 backdrop-blur-sm transition hover:border-green-500 hover:bg-green-500/20 active:scale-95"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </nav>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-4 text-center">
          <h1 className="sr-only">
            ChatKara — Authentic Indian Restaurant &amp; Chaat in Bokaro
          </h1>

          <div className="animate-fade-up">
            <Image
              src="/logo.png"
              alt={RESTAURANT.name}
              width={200}
              height={200}
              priority
              sizes="(max-width: 640px) 160px, 200px"
              className="mx-auto h-40 w-40 rounded-full object-cover shadow-[0_0_80px_rgba(212,175,55,0.35)] ring-1 ring-gold/30 sm:h-[200px] sm:w-[200px]"
            />
          </div>

          <p
            className="mt-5 max-w-sm text-sm leading-relaxed text-ink drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-base animate-fade-up"
            style={{ animationDelay: "100ms" }}
          >
            Tandoor heat, chaat spice, and slow-cooked gravies — Bokaro&apos;s
            Flavours of India.
          </p>

          <div
            className="mt-7 flex w-full max-w-xs flex-col gap-3 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/pickup"
              className="flame-bg flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-white shadow-lg shadow-flame-from/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5" />
              Order Online Pickup
            </Link>
            <Link
              href="/pickup"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gold/50 bg-black/50 py-3.5 text-sm font-semibold text-gold backdrop-blur-sm transition hover:border-gold hover:bg-gold/10 active:scale-[0.98]"
            >
              <Utensils className="h-4 w-4" />
              View Menu &amp; Prices
            </Link>
          </div>
        </div>
      </section>

      {/* Story + place — below the fold */}
      <section className="relative z-10 mx-auto w-full max-w-md px-6 py-14">
        <div className="text-center animate-fade-up">
          <h2 className="font-display text-3xl text-gold">Flavours of India</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Slow-cooked gravies, hand-ground spices, and clay-oven tandoor —
            recipes that carry the culinary soul of North India.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <div className="relative h-52 w-full overflow-hidden animate-fade-up">
            <Image
              src="/photo-facade.jpg"
              alt="ChatKara Flavors of India storefront"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  src: "/photo-roll.jpg",
                  alt: "Handcrafted Kathi Roll at ChatKara",
                },
                {
                  src: "/photo-pizza.jpg",
                  alt: "Freshly baked cheese pizza",
                },
                {
                  src: "/photo-drink.jpg",
                  alt: "Refreshing mocktail at ChatKara",
                },
                {
                  src: "/photo-patio.jpg",
                  alt: "Patio dining at ChatKara",
                },
              ] as const
            ).map((photo, i) => (
              <div
                key={photo.src}
                className="relative h-36 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 250px"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-line/50 pt-8 text-center">
          <div className="flex items-center justify-center gap-3 text-gold-soft">
            <Clock className="h-5 w-5" />
            <h3 className="font-display text-lg">Hours of Operation</h3>
          </div>
          <p className="mt-2 text-sm text-muted">
            Open Daily:{" "}
            <span className="font-semibold text-ink">12:00 PM – 11:00 PM</span>
          </p>
        </div>

        <div className="mt-10 border-t border-line/50 pt-8">
          <div className="mb-4 flex items-center justify-center gap-2 text-gold-soft">
            <MapPin className="h-5 w-5" />
            <h3 className="font-display text-lg">Find Us</h3>
          </div>
          <div className="overflow-hidden border border-line bg-bg-soft">
            <iframe
              src={
                RESTAURANT.location.mapsEmbedUrl ||
                `https://maps.google.com/maps?q=${RESTAURANT.location.lat},${RESTAURANT.location.lng}&z=16&output=embed`
              }
              title="ChatKara location on Google Maps"
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
              className="text-xs text-muted underline underline-offset-4 transition hover:text-gold"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto w-full max-w-md py-6 text-center space-y-2">
        <p className="text-xs text-muted/60">
          Website built by {RESTAURANT.developer}
        </p>
        <div>
          <Link
            href="/kitchen"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted/40 transition hover:text-gold-soft"
          >
            <Monitor className="h-3 w-3" />
            Kitchen POS
          </Link>
        </div>
      </footer>
    </main>
  );
}

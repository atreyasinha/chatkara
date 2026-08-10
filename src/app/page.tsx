import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ShoppingBag,
  Monitor,
  Clock,
  Utensils,
  ClipboardList,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Phone,
} from "lucide-react";
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
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-bg ambient">
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

      {/* Hero Section */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/photo-tikka.jpg"
            alt="Tandoori starter at ChatKara"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%] animate-ken-burns opacity-40"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-bg"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 50% 35%, rgba(0,0,0,0.5), transparent 65%), radial-gradient(ellipse 70% 45% at 50% 15%, rgba(212,175,55,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(185,28,28,0.25), transparent 50%)",
            }}
          />
        </div>

        {/* Top Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-5 py-4 md:px-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-veg animate-ping" />
            <p className="font-betania text-lg tracking-wide text-gold-soft md:text-xl">
              a La Gardenia concept
            </p>
          </div>
          <a
            href={`https://wa.me/${RESTAURANT.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact on WhatsApp"
            title="Contact on WhatsApp"
            className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-3.5 py-1.5 text-xs font-semibold text-green-400 backdrop-blur-md transition hover:border-green-400 hover:bg-green-500/20 active:scale-95 shadow-sm"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </nav>

        {/* Main Hero Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-16 pt-6 text-center">
          <h1 className="sr-only">
            ChatKara — Authentic Indian Restaurant &amp; Chaat in Bokaro
          </h1>

          {/* Status Badge */}
          <div className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold text-gold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse-soft" />
            <span>Open Daily · 12:00 PM – 11:00 PM</span>
          </div>

          {/* Glowing Brand Card */}
          <div className="animate-fade-up mx-auto w-60 overflow-hidden rounded-3xl border border-gold/30 bg-black/60 p-2 shadow-[0_0_50px_rgba(212,175,55,0.35)] backdrop-blur-md sm:w-72 transition duration-500 hover:scale-[1.02]">
            <Image
              src="/logo.png"
              alt={RESTAURANT.name}
              width={480}
              height={319}
              priority
              sizes="(max-width: 640px) 240px, 288px"
              className="h-auto w-full rounded-2xl"
            />
          </div>

          <p
            className="mt-6 max-w-md text-base leading-relaxed text-ink drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-lg animate-fade-up font-body"
            style={{ animationDelay: "100ms" }}
          >
            Tandoor heat, chaat spice &amp; slow-cooked gravies — Bokaro&apos;s
            premier <strong className="text-gold font-semibold">Flavours of India</strong>.
          </p>

          {/* Category Chips Preview */}
          <div
            className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-sm animate-fade-up"
            style={{ animationDelay: "140ms" }}
          >
            {["🌶️ Tandoori Kebabs", "🍲 Rich Gravies", "🫓 Naans & Parathas", "🧋 Coolers & Shakes"].map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-line bg-bg-elevated/70 px-3 py-1 text-[11px] font-medium text-muted backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div
            className="mt-8 flex w-full max-w-xs flex-col gap-3.5 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/pickup"
              className="flame-bg flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-bold text-white shadow-xl shadow-flame-from/30 transition hover:brightness-110 active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Order Online Pickup</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pickup"
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gold/50 bg-black/60 py-3.5 text-sm font-semibold text-gold backdrop-blur-md transition hover:border-gold hover:bg-gold/15 active:scale-[0.98]"
            >
              <Utensils className="h-4 w-4 text-gold" />
              <span>Explore Menu &amp; Prices</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="relative z-10 mx-auto w-full max-w-lg px-5 py-10">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-line bg-bg-elevated/60 p-3.5 backdrop-blur-sm animate-fade-up">
            <Flame className="mx-auto h-5 w-5 text-flame-from mb-1.5" />
            <h4 className="text-xs font-bold text-ink">Clay Tandoor</h4>
            <p className="text-[10px] text-muted mt-0.5">Smoky &amp; Fresh</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-elevated/60 p-3.5 backdrop-blur-sm animate-fade-up" style={{ animationDelay: "60ms" }}>
            <Award className="mx-auto h-5 w-5 text-gold mb-1.5" />
            <h4 className="text-xs font-bold text-ink">100% Authentic</h4>
            <p className="text-[10px] text-muted mt-0.5">Handground Spices</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-elevated/60 p-3.5 backdrop-blur-sm animate-fade-up" style={{ animationDelay: "120ms" }}>
            <Clock className="mx-auto h-5 w-5 text-veg mb-1.5" />
            <h4 className="text-xs font-bold text-ink">Fast Service</h4>
            <p className="text-[10px] text-muted mt-0.5">Dine-in &amp; Pickup</p>
          </div>
        </div>
      </section>

      {/* Story & Gallery */}
      <section className="relative z-10 mx-auto w-full max-w-md px-6 py-8">
        <div className="text-center animate-fade-up">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold/80">Culinary Experience</span>
          <h2 className="font-display text-3xl text-gold mt-1">Flavours of India</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            From clay-oven tandoori starters to rich butter curries and spiced chaats — recipes crafted for true food lovers in Bokaro.
          </p>
        </div>

        <div className="mt-8 space-y-3.5">
          <div className="relative h-56 w-full overflow-hidden rounded-3xl border border-line shadow-lg animate-fade-up">
            <Image
              src="/photo-facade.jpg"
              alt="ChatKara Flavors of India storefront"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-bg via-black/20 to-transparent"
            />
            <div className="absolute bottom-3 left-4 right-4 text-left">
              <span className="rounded-full bg-gold/20 backdrop-blur-md border border-gold/40 px-2.5 py-0.5 text-[10px] font-bold text-gold">
                LA GARDENIA BOKARO
              </span>
              <p className="text-xs font-semibold text-white mt-1">Authentic Dining Ambience</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  src: "/photo-roll.jpg",
                  alt: "Handcrafted Kathi Roll at ChatKara",
                  title: "Kathi Rolls",
                },
                {
                  src: "/photo-pizza.jpg",
                  alt: "Freshly baked pizza",
                  title: "Fresh Pizzas",
                },
                {
                  src: "/photo-drink.jpg",
                  alt: "Refreshing mocktail at ChatKara",
                  title: "Mocktails",
                },
                {
                  src: "/photo-patio.jpg",
                  alt: "Patio dining at ChatKara",
                  title: "Patio Seating",
                },
              ] as const
            ).map((photo, i) => (
              <div
                key={photo.src}
                className="group relative h-36 overflow-hidden rounded-2xl border border-line shadow-md animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 transition group-hover:opacity-60" />
                <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white drop-shadow">
                  {photo.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Map */}
        <div className="mt-12 rounded-3xl border border-line bg-bg-elevated/70 p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between border-b border-line/60 pb-3">
            <div className="flex items-center gap-2 text-gold">
              <MapPin className="h-5 w-5" />
              <h3 className="font-display text-xl font-bold">Location &amp; Maps</h3>
            </div>
            <a
              href={`tel:${RESTAURANT.phone}`}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-gold"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Us
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-bg-soft">
            <iframe
              src={
                RESTAURANT.location.mapsEmbedUrl ||
                `https://maps.google.com/maps?q=${RESTAURANT.location.lat},${RESTAURANT.location.lng}&z=16&output=embed`
              }
              title="ChatKara location on Google Maps"
              className="h-48 w-full opacity-90"
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold underline underline-offset-4 transition hover:brightness-125"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-md py-8 text-center space-y-3">
        <p className="text-xs text-muted/60">
          Website &amp; Ordering System built for {RESTAURANT.name}
        </p>
        <div className="flex items-center justify-center gap-4 border-t border-line/40 pt-4">
          <Link
            href="/admin/waiter"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted/60 transition hover:text-gold"
          >
            <ClipboardList className="h-3 w-3" />
            Waiter
          </Link>
          <span className="text-muted/30">·</span>
          <Link
            href="/kitchen"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted/60 transition hover:text-gold"
          >
            <Monitor className="h-3 w-3" />
            Kitchen POS
          </Link>
        </div>
      </footer>
    </main>
  );
}

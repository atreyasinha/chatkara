import Image from "next/image";
import Link from "next/link";
import { MapPin, ShoppingBag, Monitor, Clock } from "lucide-react";
import { RESTAURANT } from "@/lib/restaurant";


export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "ChatKara",
            "image": "https://chatkara.lagardenia.in/og-image.png",
            "@id": "https://chatkara.lagardenia.in",
            "url": "https://chatkara.lagardenia.in",
            "telephone": RESTAURANT.phone,
            "priceRange": "₹",
            "menu": "https://chatkara.lagardenia.in/pickup",
            "servesCuisine": "Indian, Street Food, Chaat, Desserts",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Bokaro Steel City",
              "addressLocality": "Bokaro",
              "addressRegion": "Jharkhand",
              "postalCode": "827001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 23.619147660495543,
              "longitude": 86.18070429732468
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "12:00",
              "closes": "23:00"
            }
          })
        }}
      />
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
        <p className="font-betania text-xl tracking-wide text-gold-soft/90">
          a La Gardenia concept
        </p>
      </nav>

      {/* Main Section */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-10 pt-16 text-center">
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

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-2xl border border-line shadow-md">
            <Image
              src="/photo-roll.jpg"
              alt="Handcrafted Kathi Roll at ChatKara"
              width={1024}
              height={1024}
              className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 250px"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line shadow-md">
            <Image
              src="/photo-pizza.jpg"
              alt="Freshly baked cheese pizza on wooden paddle"
              width={1024}
              height={764}
              className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 250px"
            />
          </div>
          <div className="col-span-2 overflow-hidden rounded-2xl border border-line shadow-md">
            <Image
              src="/photo-drink.jpg"
              alt="Refreshing drinks & mocktails at ChatKara bar"
              width={764}
              height={1024}
              className="h-48 w-full object-cover object-center transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line shadow-md">
            <Image
              src="/photo-ambiance.jpg"
              alt="Outdoor garden seating with purple ambient lighting"
              width={764}
              height={1024}
              className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 250px"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-line shadow-md">
            <Image
              src="/photo-patio.jpg"
              alt="Patio dining setup under umbrellas at ChatKara"
              width={764}
              height={1024}
              className="h-40 w-full object-cover transition duration-300 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 250px"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="mt-8 border-t border-line/50 pt-6">
          <div className="flex items-center gap-3 justify-center text-gold-soft">
            <Clock className="h-5 w-5" />
            <h3 className="font-display text-lg">Hours of Operation</h3>
          </div>
          <p className="mt-2 text-center text-sm text-muted">
            Open Daily: <span className="font-semibold text-ink">12:00 PM – 11:00 PM</span>
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
              src={RESTAURANT.location.mapsEmbedUrl || `https://maps.google.com/maps?q=${RESTAURANT.location.lat},${RESTAURANT.location.lng}&z=16&output=embed`}
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

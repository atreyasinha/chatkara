import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3, Caveat } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const betania = Caveat({
  variable: "--font-betania",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChatKara — Authentic Indian Restaurant & Chaat in Bokaro",
    template: "%s | ChatKara Restaurant",
  },
  description:
    "Order online for pickup or dine-in at ChatKara, Bokaro Steel City. Enjoy authentic North & South Indian delicacies, tandoori starters, street food, chaat & beverages at La Gardenia.",
  keywords: [
    "ChatKara",
    "ChatKara Bokaro",
    "Restaurant in Bokaro",
    "Indian Restaurant Bokaro",
    "Chaat Bokaro",
    "La Gardenia Bokaro",
    "Online Food Order Bokaro",
    "Tandoori Bokaro",
    "Bokaro Steel City Restaurant",
    "Street Food Bokaro",
    "Flavours of India",
  ],
  authors: [{ name: "Shriumasha Enterprises Private Limited" }],
  creator: "Shriumasha Enterprises Private Limited",
  publisher: "Shriumasha Enterprises Private Limited",
  metadataBase: new URL("https://chatkara.lagardenia.in"),
  alternates: {
    canonical: "https://chatkara.lagardenia.in",
  },
  openGraph: {
    title: "ChatKara — Authentic Indian Restaurant & Chaat in Bokaro",
    description:
      "Order online for pickup or dine-in at ChatKara, Bokaro Steel City. Enjoy authentic North & South Indian delicacies, tandoori starters, street food, chaat & beverages at La Gardenia.",
    url: "https://chatkara.lagardenia.in",
    siteName: "ChatKara",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChatKara — Flavours of India",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatKara — Authentic Indian Restaurant & Chaat in Bokaro",
    description:
      "Order online for pickup or dine-in at ChatKara, Bokaro Steel City. Enjoy authentic North & South Indian delicacies, tandoori starters, street food, chaat & beverages at La Gardenia.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "TMCdqtonTUx8n-KjoyFzCH7qZhz1fXBw4Bfz83LCFGA",
  },
  category: "restaurant",
  icons: {
    icon: [
      { url: "https://chatkara.lagardenia.in/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "https://chatkara.lagardenia.in/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "https://chatkara.lagardenia.in/icon.png", sizes: "512x512", type: "image/png" },
      { url: "https://chatkara.lagardenia.in/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
    ],
    shortcut: "https://chatkara.lagardenia.in/favicon.ico",
    apple: [
      { url: "https://chatkara.lagardenia.in/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${betania.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ambient">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-BLM6SRPNHG"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-BLM6SRPNHG');
        `}
      </Script>
    </html>
  );
}

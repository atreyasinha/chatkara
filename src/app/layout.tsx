import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ChatKara — Flavours of India",
  description:
    "Order from your table at ChatKara. Scan the QR code and enjoy Flavours of India.",
  metadataBase: new URL("https://chatkara.lagardenia.in"),
  openGraph: {
    title: "ChatKara — Flavours of India",
    description:
      "Order from your table at ChatKara. Scan the QR code and enjoy Flavours of India.",
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
    title: "ChatKara — Flavours of India",
    description:
      "Order from your table at ChatKara. Scan the QR code and enjoy Flavours of India.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ambient">{children}</body>
    </html>
  );
}

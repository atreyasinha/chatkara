# ChatKara POS

QR-code table ordering for **ChatKara — Flavours of India** (Bokaro, Jharkhand).

Live URL: [https://chatkara.lagardenia.in](https://chatkara.lagardenia.in)

## Features

- **Table QR ordering** — guests scan a code → `/table/1` … `/table/20`
- **Official PDF Menu & Prices** — accurate pricing configured in `src/lib/menu.ts` extracted directly from `chatkara menu (1).pdf`
- **Payments** — UPI (GPay / PhonePe / Paytm deep link + QR) and cash at table
- **Kitchen POS** — live order board at `/kitchen`
- **Printable QR sheet** — `/admin/qr`

## Prerequisites

This project uses [mise](https://mise.jdx.dev/) for Node (no global Node install). Pin is in `mise.toml` (`node = "20"`).

```bash
mise trust
mise install   # uses Node 20 from mise
```

## Quick start

1. Create a `.env.local` file in the root based on `.env.example` and add your Firebase credentials.
2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Before going live

1. Set your real UPI ID and payee name in `src/lib/restaurant.ts` (`upiId`, `upiPayeeName`).
2. Verify GST percentage in `src/lib/restaurant.ts` (`gstPercent`).
3. Open `/kitchen` on a tablet or dashboard phone behind the counter to manage incoming orders.

## Database (Firebase Firestore)

Orders are stored in a persistent **Cloud Firestore** NoSQL database instance (in `(default)` mode), resolving serverless in-memory data loss. 

To run the application (both locally and on Vercel), the following environment variables are required:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

These are loaded securely on the server side inside the Next.js API routes (`src/app/api/orders/`).

## Location

- Coordinates: `23.619147660495543, 86.18070429732468`
- City: Bokaro, Jharkhand, India

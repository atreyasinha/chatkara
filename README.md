# ChatKara POS

QR-code table ordering for **ChatKara — Flavours of India** (Bokaro, Jharkhand).

## Features

- **Table QR ordering** — guests scan a code → `/table/1` … `/table/20`
- **Full menu** from your PDF with estimated INR prices (editable in `src/lib/menu.ts`)
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

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Before going live

1. Set your real UPI ID in `src/lib/restaurant.ts` (`upiId`).
2. Adjust menu prices in `src/lib/menu.ts`.
3. Deploy to a public URL (Vercel works well), then print QR codes from `/admin/qr` so phones can open the links.
4. Open `/kitchen` on a tablet/phone behind the counter.

## Database (GCP)

Orders are currently in-memory (`src/lib/orders.ts`) for local demos. For production, the intended store is a **GCP** database — typically **Cloud SQL for PostgreSQL** (or Firestore if you prefer document style). The order API routes already sit behind a thin store layer, so swapping in Cloud SQL is the next step when you're ready.

## Location

- Coordinates: `23.619147660495543, 86.18070429732468`
- City: Bokaro, Jharkhand, India

## Notes

- GST is set to 5% in `src/lib/restaurant.ts` — change if your rate differs.
- Prices are **estimates** for a mid-range Bokaro restaurant; replace with your actual rates.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), React, Tailwind CSS 4, Firebase Firestore, Node test runner & Playwright.

## Users

- **Dine-in Customers**: Restaurant patrons sitting at tables scanning table QR codes or ordering online. They need rapid menu browsing, instant cart feedback, clear price totals, and zero login friction.
- **Pickup Customers**: Customers ordering remotely or at the counter for takeaway. They need fast item selection and easy UPI/Cash payment steps.
- **Waiters & Floor Staff**: Restaurant staff entering digital orders directly onto tables mid-shift. They operate on mobile devices and need single-tap order submission, fast dish search, and real-time status visibility.
- **Kitchen Staff**: Chefs and kitchen crew managing active order tickets. They need clear item counts, live order lifecycle statuses (`Received` → `Cooking` → `Ready` → `Served`), and high-contrast scannability.

## Product Purpose

ChatKara is the official digital ordering and POS system for ChatKara (a La Gardenia concept) in Bokaro Steel City. It turns paper-based ordering into a real-time, digital kitchen and waiter workflow with zero customer friction.

## Positioning

Bokaro's premier authentic Indian restaurant & chaat experience, blending clay-oven tandoori starters, slow-cooked gravies, hand-ground spices, and fast digital table service.

## Operating Context

- Mobile-first touchscreen devices used by waiters on restaurant floors.
- High-heat, fast-paced kitchen environment where order tickets must be readable from a distance.
- Indian mobile payment ecosystem (UPI, GPay, PhonePe, Paytm, Cash).

## Capabilities and Constraints

- Dine-in QR code table ordering (Tables 1–7) & counter pickup (Table 0).
- Role-based staff authentication (Waiter vs. Admin roles).
- Real-time Firestore order synchronization.
- Telegram kitchen bot notification system.

## Brand Commitments

- Name: ChatKara (Flavours of India — a La Gardenia concept).
- Aesthetic: Warm, inviting, authentic North Indian culinary atmosphere (gold, flame orange, warm charcoal backgrounds, typography-led hierarchy).

## Product Principles

1. **Zero Friction Ordering**: Customers & waiters can complete orders in under 30 seconds.
2. **Kitchen Clarity**: Kitchen tickets prioritize item counts and status progression with high-contrast visual hierarchy.
3. **Impeccable Touch Ergonomics**: All interactive elements target 48px+ touch bounds with 16px+ inputs to eliminate mobile zoom/accidental taps.

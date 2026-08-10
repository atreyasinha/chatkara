---
name: ChatKara Design System
description: Authentic Indian Restaurant & Chaat POS and Ordering Interface
colors:
  bg: "#0a0a0a"
  bg-elevated: "#141414"
  bg-soft: "#1a1a1a"
  gold: "#d4af37"
  gold-soft: "#e2c158"
  gold-dim: "rgba(212, 175, 55, 0.18)"
  flame-from: "#f97316"
  flame-to: "#b91c1c"
  text: "#f5f0e8"
  text-muted: "#a89f91"
  border: "rgba(212, 175, 55, 0.28)"
  veg: "#22c55e"
  nonveg: "#ef4444"
  egg: "#eab308"
typography:
  display:
    fontFamily: "var(--font-display), Cormorant Garamond, Georgia, serif"
  body:
    fontFamily: "var(--font-body), Source Sans 3, system-ui, sans-serif"
  accent:
    fontFamily: "var(--font-betania), Caveat, cursive"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
components:
  button-flame:
    backgroundColor: "{colors.flame-from}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
  button-gold-outline:
    backgroundColor: "rgba(0,0,0,0.6)"
    textColor: "{colors.gold}"
    rounded: "{rounded.xl}"
    padding: "12px 20px"
---

# ChatKara Design System

## Overview
ChatKara's visual identity reflects authentic Indian restaurant culture — tandoor heat, rich spices, and slow-cooked gravies. The visual system uses dark ambient glassmorphism (`rgba(20,20,20,0.7)` with `backdrop-filter: blur(16px)`), warm golden text hierarchy (`#d4af37`), and vibrant dietary indicators (green for veg, red for non-veg).

## Colors
- **Backgrounds**: Deep warm charcoal `#0a0a0a` with ambient radial gradients. Elevated cards use `#141414` and `#1a1a1a`.
- **Accents**: Muted metallic gold `#d4af37` for headlines, borders, and brand badges. Flame orange `#f97316` for primary order CTAs.
- **Dietary Badges**: Green `#22c55e` (Veg), Red `#ef4444` (Non-veg), Yellow `#eab308` (Egg).

## Typography
- **Display**: Cormorant Garamond for elegant section titles, restaurant headings, and price totals.
- **Body**: Source Sans 3 for high-legibility menu descriptions, order ticket details, and table labels.
- **Accent**: Caveat for playful tagline highlights (*"a La Gardenia concept"*).

## Layout
- Mobile-first single-column container (`max-w-md` on consumer views, `max-w-lg` on waiter POS).
- Fixed bottom sticky bar for floating cart checkout with 16px safe padding.

## Elevation & Depth
- Glassmorphism backdrop blur (`backdrop-filter: blur(16px)`).
- Glowing golden border rings (`box-shadow: 0 0 25px rgba(212, 175, 55, 0.18)`).

## Shapes
- Extra-rounded corners (`rounded-2xl` and `rounded-3xl` / 16px to 24px radius) for tactile touch targets.
- Touch bounds guaranteed at 44px+ height on all interactive buttons.

## Components
- **Card**: Glass container with `border border-gold/25` and subtle hover scale.
- **Status Badges**: Semi-transparent pills (`bg-gold/15 text-gold`, `bg-veg/15 text-veg`, `bg-nonveg/15 text-nonveg`).
- **Input Fields**: Dark soft background `#1a1a1a` with minimum `font-size: 16px` to prevent mobile auto-zoom.

## Do's and Don'ts
- **DO**: Use solid warm colors for headings instead of noisy text-gradients.
- **DO**: Ensure touch targets are at least 44px for waiters on mobile screens.
- **DON'T**: Use generic pure blue or purple SaaS gradients.
- **DON'T**: Nest cards inside cards with double borders.

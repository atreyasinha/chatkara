## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.

## 2024-07-24 - Context-aware focus rings for POS Actions
**Learning:** Customizing keyboard focus indicator colors to match their action's semantics (e.g., green for WhatsApp, red for Cancel, gold for general actions) greatly enhances visual clarity for keyboard-only users, preventing a sea of generic blue rings.
**Action:** When adding `focus-visible:ring-*` classes, always consider matching the ring color to the specific semantic purpose or border color of the interactive element.

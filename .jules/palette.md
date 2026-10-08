## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2026-08-05 - Toggle Buttons Need Explicit ARIA States
**Learning:** In standard filter lists and category chips (e.g., TableOrderClient, WaiterOrderClient), CSS classes (like `"bg-gold text-bg font-semibold"`) handle the visual active state, but screen readers are completely unaware of this context change without explicit attributes.
**Action:** When implementing toggle or filter buttons, always accompany visual active/selected state changes with `aria-pressed={isActive}` or `aria-current="page"` to ensure screen reader users are notified of the state toggle.
## 2026-10-08 - Adding explicit labels and state context to rapid-entry components
**Learning:** Waiter POS interfaces depend heavily on icon-only rapid entry (like quantity +/-) and expandable off-menu dialogs. A lack of `aria-label`s on modifier buttons or `aria-expanded` attributes on toggles severely impacts accessibility and removes context for screen-reader users.
**Action:** When working on dense POS or internal tools, proactively add explicit `aria-label`s to icon-only controls and `aria-expanded` attributes to toggles.

## 2026-08-31 - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2026-08-05 - Toggle Buttons Need Explicit ARIA States
**Learning:** In standard filter lists and category chips (e.g., TableOrderClient, WaiterOrderClient), CSS classes (like `"bg-gold text-bg font-semibold"`) handle the visual active state, but screen readers are completely unaware of this context change without explicit attributes.
**Action:** When implementing toggle or filter buttons, always accompany visual active/selected state changes with `aria-pressed={isActive}` or `aria-current="page"` to ensure screen reader users are notified of the state toggle.
## 2026-08-31 - Explicit ARIA Labels for Rapid-Entry Forms and Collapsibles
**Learning:** Collapsible sections without explicit ARIA states and rapid-entry forms (like the "Off-Menu Custom Item" form) that rely entirely on placeholder attributes for labeling are inaccessible to screen readers. Screen readers need `aria-expanded` to announce state toggles and explicit `aria-label`s on form inputs when visible text `<label>` elements are omitted for visual compactness.
**Action:** Always add `aria-expanded` to collapsible buttons and explicit `aria-label` attributes to any `<input>` or `<select>` elements that only use visual placeholders, ensuring full screen reader accessibility.

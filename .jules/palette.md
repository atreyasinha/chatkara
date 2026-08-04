## 2024-08-04 - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.

## 2024-08-04 - Add aria-pressed state to filter chips
**Learning:** Filter chips acting as toggle buttons need the `aria-pressed` attribute to properly communicate their active state to screen readers.
**Action:** Always add `aria-pressed={isActive}` and ensure visible focus states (`focus-visible:ring-2`) are present for keyboard accessibility when implementing chip-based filters or toggle buttons.

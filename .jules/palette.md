## 2025-02-12 - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2025-02-12 - Adding aria-pressed to filter and category chips
**Learning:** Filter toggles and category chips visually indicate an active state but screen readers have no way of knowing this without `aria-pressed`. It's a common accessibility oversight in custom toggle components. In addition, providing clear `focus-visible` outlines is crucial for keyboard navigation, and many interactive elements lacked these custom visible outlines.
**Action:** Always add `aria-pressed={isActive}` to toggle buttons (like filters or category chips) and ensure that `focus-visible:ring-2` (or equivalent) is added to all interactive elements to improve keyboard accessibility.

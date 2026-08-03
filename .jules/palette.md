## 2024-08-05 - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2024-08-05 - Added aria-pressed to toggle buttons
**Learning:** Screen readers rely on ARIA attributes to understand the state of interactive elements. Toggle buttons visually change state, but without `aria-pressed`, screen readers announce them as normal buttons. This makes it impossible for visually impaired users to know which filter is currently active.
**Action:** When implementing toggle buttons or selectable chips, always use the `aria-pressed={isActive}` attribute to convey state to assistive technologies.

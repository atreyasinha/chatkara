## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.

## 2024-08-01 - Communicating toggle state in filter controls
**Learning:** Found multiple filter components (dietary filters, kitchen active/all tabs) and payment selectors that looked like standard buttons but functioned as toggles/radio groups. While the visual state was clear via styling, screen readers were not informed of the current active selection.
**Action:** Always add `aria-pressed={condition}` to toggle buttons that maintain a pressed/active state, particularly in POS systems where users might depend heavily on keyboard/screen reader navigation to process orders quickly. Added `aria-controls` for regions toggled dynamically.

## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.

## 2024-05-18 - ARIA labels breaking E2E tests
**Learning:** Adding context-aware ARIA labels (e.g. changing `aria-label="Add"` to `aria-label="Add Butter Chicken to cart"`) can break Playwright E2E tests that rely on strict string matching for accessible names (`page.getByRole("button", { name: /^add$/i })`).
**Action:** When updating accessible names for screen readers, always search the `tests/e2e` directory for the old label and update the selectors to use regex that matches the new dynamic labels (e.g. `name: /^Add .* to cart$/i`).

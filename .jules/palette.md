## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2026-08-05 - Toggle Buttons Need Explicit ARIA States
**Learning:** In standard filter lists and category chips (e.g., TableOrderClient, WaiterOrderClient), CSS classes (like `"bg-gold text-bg font-semibold"`) handle the visual active state, but screen readers are completely unaware of this context change without explicit attributes.
**Action:** When implementing toggle or filter buttons, always accompany visual active/selected state changes with `aria-pressed={isActive}` or `aria-current="page"` to ensure screen reader users are notified of the state toggle.
## 2026-09-23 - Complete Coverage for Icon Buttons
**Learning:** It's common to miss ARIA labels on secondary or repeated instances of icon-only buttons, such as quantity modifiers within a cart summary list, or icon buttons in error/empty states.
**Action:** Always ensure *all* instances of icon-centric action buttons, regardless of their location (primary UI or secondary states), explicitly include `aria-label` attributes for consistent screen reader accessibility.
## 2026-09-23 - Handle Dummy Credentials in CI Tests
**Learning:** GitHub Actions secrets might be redacted or replaced with dummy values (like `***` or empty strings) in fork PRs. If integration tests blindly rely on the presence of these environment variables without validating their format, they can attempt to connect with invalid credentials, leading to 503 errors and CI failures instead of gracefully skipping.
**Action:** When writing tests that require external credentials (like Firebase), robustly verify the credentials are real (e.g., checking if `FIREBASE_API_KEY.startsWith("AIza")`) so the test suite can gracefully skip rather than fail unexpectedly.

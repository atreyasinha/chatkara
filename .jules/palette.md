## $(date +%Y-%m-%d) - Added helpful CTA to empty search state
**Learning:** Empty states caused by restrictive filters/searches are a common UX dead end. Providing a single "Clear search & filters" button drastically improves the user's ability to recover from overly specific queries.
**Action:** Always include a way to easily reset applied filters when presenting a "no results" state to the user.
## 2024-07-25 - Cart Empty State Message and Call to Action
**Learning:** Empty states are a critical, frequently-overlooked part of the micro-UX. The cart component was relying on rendering an empty list of items, making it confusing and visually unbalanced when items were removed. Adding a descriptive empty state message with a specific call-to-action (like "Browse menu") provides immediate feedback and directs users on what to do next.
**Action:** When working on modals or lists with removable items, always check for and address the empty state. Provide a helpful icon, a short message explaining the state, and a clear action button if applicable.
## 2026-08-05 - Toggle Buttons Need Explicit ARIA States
**Learning:** In standard filter lists and category chips (e.g., TableOrderClient, WaiterOrderClient), CSS classes (like `"bg-gold text-bg font-semibold"`) handle the visual active state, but screen readers are completely unaware of this context change without explicit attributes.
**Action:** When implementing toggle or filter buttons, always accompany visual active/selected state changes with `aria-pressed={isActive}` or `aria-current="page"` to ensure screen reader users are notified of the state toggle.
## 2026-10-24 - Screen Reader Support in Dense POS Interfaces
**Learning:** In high-density Point-of-Sale (POS) interfaces (like WaiterOrderClient), visual labels are often omitted in favor of placeholders to save screen real estate. This completely breaks accessibility for screen reader users who rely on explicit context for inputs. Additionally, collapsible utility panels lack state indicators, leaving assistive tech blind to visibility changes.
**Action:** When working on rapid-entry or density-optimized UI components, always compensate for omitted visual labels by adding explicit `aria-label` attributes to inputs and `aria-expanded` with `aria-controls` to collapsible toggles.

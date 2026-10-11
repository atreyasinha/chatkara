## 2026-07-20 - Consistent ARIA Labels on Reusable Patterns
**Learning:** When implementing accessibility (like `aria-label`) on interactive elements such as quantity adjusters (+/- buttons), it's crucial to check all instances of those buttons across different views (e.g., both the main menu list and the cart modal) as they are often duplicated rather than extracted into a shared component.
**Action:** Always search the file or codebase for similar patterns or duplicated HTML to ensure accessibility improvements are applied universally across all states of the component.

## 2026-10-11 - Add ARIA attributes to standalone POS controls
**Learning:** In high-density POS interfaces, visually obvious controls (like quantity +/- or rapid entry fields) are often unlabelled. Relying solely on visual cues breaks accessibility.
**Action:** Explicitly add `aria-label` attributes to standalone rapid-entry inputs and icon-only quantity modifiers, and ensure collapsible toggle buttons use `aria-expanded` and `aria-controls` linked to the controlled container's `id`.

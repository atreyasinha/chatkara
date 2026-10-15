## 2026-07-20 - Consistent ARIA Labels on Reusable Patterns
**Learning:** When implementing accessibility (like `aria-label`) on interactive elements such as quantity adjusters (+/- buttons), it's crucial to check all instances of those buttons across different views (e.g., both the main menu list and the cart modal) as they are often duplicated rather than extracted into a shared component.
**Action:** Always search the file or codebase for similar patterns or duplicated HTML to ensure accessibility improvements are applied universally across all states of the component.
## 2026-10-15 - Accessible High-Density POS Interfaces
**Learning:** Omitted visual labels in high-density POS interfaces (like rapid-entry inputs) severely impact screen readers. Collapsible toggles also need explicit aria-expanded/controls attributes.
**Action:** Always explicitly add aria-label attributes to standalone rapid-entry inputs and icon-only quantity modifiers, and ensure collapsible toggle buttons use aria-expanded and aria-controls linked to the controlled container's id.

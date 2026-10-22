## 2026-07-20 - Consistent ARIA Labels on Reusable Patterns
**Learning:** When implementing accessibility (like `aria-label`) on interactive elements such as quantity adjusters (+/- buttons), it's crucial to check all instances of those buttons across different views (e.g., both the main menu list and the cart modal) as they are often duplicated rather than extracted into a shared component.
**Action:** Always search the file or codebase for similar patterns or duplicated HTML to ensure accessibility improvements are applied universally across all states of the component.

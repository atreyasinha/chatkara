## 2024-05-15 - [Menu Search Optimization]
**Learning:** Client-side static menu data should have derived search formats pre-computed at load time rather than dynamically during search.
**Action:** Always check if string matching and regex normalizations in iterative functions (like `.filter`) can be pre-computed for static data arrays.

## 2026-07-22 - [O(1) Map Lookups in React renders]
**Learning:** Re-renders mapping large arrays (like a menu) and executing an O(N) `.find()` on another list (like a cart) per iteration causes O(N*M) performance bottlenecks.
**Action:** Use a memoized `Map` keyed by item ID for O(1) lookups during array mapping.

## 2026-07-23 - [React Rendering & Cart State Optimization]
**Learning:** Mapping over a large array (like a menu) and conditionally rendering inline elements that depend on frequently updated state (like cart items) causes the entire list to re-render for every single cart modification.
**Action:** Extract large list items into independent components wrapped in `React.memo()` to ensure only modified items re-render when state updates.

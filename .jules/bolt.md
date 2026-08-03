## 2024-05-15 - [Menu Search Optimization]
**Learning:** Client-side static menu data should have derived search formats pre-computed at load time rather than dynamically during search.
**Action:** Always check if string matching and regex normalizations in iterative functions (like `.filter`) can be pre-computed for static data arrays.

## 2026-07-22 - [O(1) Map Lookups in React renders]
**Learning:** Re-renders mapping large arrays (like a menu) and executing an O(N) `.find()` on another list (like a cart) per iteration causes O(N*M) performance bottlenecks.
**Action:** Use a memoized `Map` keyed by item ID for O(1) lookups during array mapping.

## 2026-07-23 - [React Rendering & Cart State Optimization]
**Learning:** Mapping over a large array (like a menu) and conditionally rendering inline elements that depend on frequently updated state (like cart items) causes the entire list to re-render for every single cart modification.
**Action:** Extract large list items into independent components wrapped in `React.memo()` to ensure only modified items re-render when state updates.

## 2026-07-26 - [Search Input Debouncing via useDeferredValue]
**Learning:** Instantly filtering a large array on every keystroke can block the main thread and cause typing lag, particularly on lower-end devices.
**Action:** Use React's `useDeferredValue` hook on text inputs that drive large list filtering. This prioritizes input rendering (making typing feel instant) and defers the expensive filtering computation to the background.

## 2024-08-03 - Firebase Query Constraints & Types
**Learning:** When conditionally appending constraints like `where` and `orderBy` into an array for Firestore `query()`, TypeScript may throw union inference errors (e.g., 'QueryFieldFilterConstraint' not being assignable to 'QueryOrderByConstraint') if you use `any[]`.
**Action:** Explicitly import and type the array as `QueryConstraint[]` from `firebase/firestore` rather than `any[]` to satisfy strict linting rules and ensure type safety.

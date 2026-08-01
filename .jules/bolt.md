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

## 2026-08-01 - Bound Firestore Queries
**Learning:** In Firebase, querying with `where` and `orderBy` on the same field (e.g., `createdAt`) uses a single-field index and does not require a composite index. Always bound time-based queries (e.g., fetching active orders for polling loops or analytics) with conditions like `where('createdAt', '>=', since)` to prevent unbounded O(N) database reads and performance bottlenecks as the database grows.
**Action:** When querying orders for real-time polling or dashboard analytics, ensure an appropriate timeframe is calculated and applied to the query.

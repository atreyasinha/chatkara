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
## 2024-08-04 - Bounding Firebase Queries
**Learning:** When querying Firebase collections (e.g., fetching orders for polling loops or analytics), failing to use bounded time conditions (e.g., `where('createdAt', '>=', since)`) leads to unbounded O(N) database reads and subsequent performance bottlenecks as the collection grows.
**Action:** Always pass a `since` parameter when listing records for recent activity feeds or analytics, ensuring the default polling and stream queries are capped to a sensible window (e.g., 48 hours for active operations or the start of the current year for annual reports).
## 2024-08-05 - Pause background API polling
**Learning:** React components using `setInterval` for polling continue to fire even when the browser tab is hidden or backgrounded on mobile devices. This causes unnecessary network requests, drains battery, and can hit server rate limits or cost constraints on API endpoints (like Firebase).
**Action:** When implementing polling via `setInterval`, always wrap the API call in a `if (document.visibilityState === "visible")` check, and complement it with a `visibilitychange` event listener to instantly sync data when the user returns to the tab.
## 2024-08-06 - [WaiterOrderClient Search and Rendering Optimization]
**Learning:** Instantly filtering a large array on every keystroke blocks the main thread, and `O(N)` lookups inside `O(M)` map operations cause `O(N*M)` rendering complexity.
**Action:** Used `useDeferredValue` for the search input to prioritize responsiveness, and replaced the nested `Array.prototype.find()` call with a memoized `Map` for `O(1)` cart lookups during menu rendering.

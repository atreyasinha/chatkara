## 2026-10-17 - Extract MenuItemRow from WaiterOrderClient
**Learning:** Found an O(N*M) issue with React rendering a large un-memoized list (~150 items) where only one item updates its state (e.g., cart quantities changing re-renders the whole menu) and array lookup was done with items.find().
**Action:** Extract inline elements into memoized components and use a Map for O(1) lookups.

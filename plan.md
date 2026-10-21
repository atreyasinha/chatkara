1. Use `replace_with_git_merge_diff` to modify `tests/helpers/fixtures.ts` to properly check if `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` are valid (not `***` and not structured dummy strings) to correctly skip tests in CI.

Provide the following replacements:

<<<<<<< SEARCH
export function firebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_API_KEY,
  );
}
=======
export function firebaseConfigured(): boolean {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;

  if (!projectId || !apiKey) return false;

  const isDummy = (val: string) =>
    val === "***" || val.toLowerCase().includes("dummy");

  return !isDummy(projectId) && !isDummy(apiKey);
}
>>>>>>> REPLACE

2. Use `run_in_bash_session` to run `pnpm test:integration && pnpm lint`.
3. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
4. Use the `submit` tool to create a PR on the branch `bolt/optimize-waiter-order` with the title "⚡ Bolt: Optimize WaiterOrderClient performance". The description will be: "What: Added useDeferredValue to the search query, memoized the menu item rows, and implemented an O(1) map for cart item lookups. Why: To prevent the entire large menu list from re-rendering on every cart quantity change and to avoid UI blocking during search filtering. Impact: Eliminates O(N^2) lookups and significantly reduces re-renders, improving responsiveness on lower-end devices. Measurement: Verified by interacting with search and cart in the waiter UI. Additionally, fixed CI environment variable dummy checks in tests/helpers/fixtures.ts to ensure integration tests gracefully skip when actual Firebase credentials are not provided." formatted as a single continuous paragraph without using any bullet points.

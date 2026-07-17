#!/usr/bin/env tsx
/**
 * Standalone cleanup for nightly CI / local use:
 *   npm run test:cleanup
 *
 * Requires Firebase env vars (from shell, GitHub Secrets, or:
 *   node --env-file=.env.local --import tsx scripts/cleanup-test-orders.ts
 */
async function main() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("FIREBASE_PROJECT_ID missing — nothing to clean");
    process.exit(1);
  }
  const { deleteTestOrders } = await import("../src/lib/orders.ts");
  const n = await deleteTestOrders();
  console.log(`Deleted ${n} test order(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env tsx
/**
 * Optional manual wipe of Dev Firestore docs tagged isTest:true.
 * Not run by CI — test orders are kept on chatkara-dev.
 *
 *   npm run test:cleanup
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

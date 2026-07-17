import { deleteTestOrders } from "../../src/lib/orders.ts";

/** Remove all Firestore orders tagged isTest:true. Safe for nightly CI. */
export async function cleanupTestData(): Promise<number> {
  const deleted = await deleteTestOrders();
  console.log(`Cleanup: deleted ${deleted} test order(s) from Firestore`);
  return deleted;
}

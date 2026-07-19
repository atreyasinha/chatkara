import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { randomUUID } from "crypto";
import { computeOrderTotals, mergeCartItems } from "./order-math";
import type { CartItem, Order, OrderStatus, PaymentMethod } from "./types";

const ORDERS_COLLECTION = "orders";

/**
 * Retrieve all orders from Firestore, ordered by creation date (newest first).
 */
export async function listOrders(): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const results: Order[] = [];
    querySnapshot.forEach((snap) => {
      const data = snap.data() as Order;
      results.push({
        ...data,
        id: data.id || snap.id,
        subtotal: data.subtotal || data.total || 0,
        gst: data.gst || 0,
        paymentMethod: data.paymentMethod || "cash",
        paymentStatus: data.paymentStatus || "pending",
      });
    });
    return results;
  } catch (error) {
    console.error("Error listing orders from Firestore:", error);
    return [];
  }
}

/**
 * Retrieve a specific order by its document ID.
 */
export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Order;
      return {
        ...data,
        id: data.id || docSnap.id,
        subtotal: data.subtotal || data.total || 0,
        gst: data.gst || 0,
        paymentMethod: data.paymentMethod || "cash",
        paymentStatus: data.paymentStatus || "pending",
      };
    }
    return undefined;
  } catch (error) {
    console.error(`Error getting order ${id} from Firestore:`, error);
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanUndefined(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefined(item));
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)]),
    );
  }
  return obj;
}

export async function createOrder(input: {
  tableNumber: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  parentOrderId?: string;
  isTest?: boolean;
}): Promise<Order> {
  const now = new Date().toISOString();

  if (input.parentOrderId) {
    try {
      const parentOrder = await getOrder(input.parentOrderId);
      if (
        parentOrder &&
        parentOrder.status !== "served" &&
        parentOrder.status !== "cancelled" &&
        parentOrder.paymentStatus !== "paid"
      ) {
        const mergedItems = mergeCartItems(parentOrder.items, input.items);
        const { subtotal, gst, total } = computeOrderTotals(mergedItems);

        // Keep kitchen progress; flag so staff sees new items were added.
        const updatedOrder: Order = {
          ...parentOrder,
          items: mergedItems,
          subtotal,
          gst,
          total,
          status: parentOrder.status,
          needsKitchenAck: true,
          updatedAt: now,
          isTest: parentOrder.isTest || input.isTest,
        };

        if (input.notes) {
          updatedOrder.notes = parentOrder.notes
            ? `${parentOrder.notes} | ${input.notes}`
            : input.notes;
        }

        const docRef = doc(db, ORDERS_COLLECTION, parentOrder.id);
        await setDoc(docRef, cleanUndefined(updatedOrder));
        return updatedOrder;
      }
    } catch (err) {
      console.error(
        "Failed to append to parent order, fallback to new order:",
        err,
      );
    }
  }

  const id = randomUUID();
  const { subtotal, gst, total } = computeOrderTotals(input.items);

  const order: Order = {
    id,
    tableNumber: input.tableNumber,
    items: input.items,
    subtotal,
    gst,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus:
      input.paymentMethod === "cash" ? "cash_on_delivery" : "pending",
    status: "pending",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    isTest: input.isTest || undefined,
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await setDoc(docRef, cleanUndefined(order));
  } catch (error) {
    console.error("Error creating order in Firestore:", error);
    throw error;
  }

  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  try {
    const order = await getOrder(id);
    if (!order) return undefined;

    order.status = status;
    const nowStr = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {
      status: order.status,
      updatedAt: nowStr,
    };

    if (status === "served") {
      order.completedAt = nowStr;
      updates.completedAt = nowStr;
    }

    order.updatedAt = nowStr;
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, updates);
    return order;
  } catch (error) {
    console.error(`Error updating status for order ${id} in Firestore:`, error);
    return undefined;
  }
}

export async function markOrderPaid(id: string): Promise<Order | undefined> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    const order = docSnap.data() as Order;
    order.paymentStatus = "paid";
    if (order.status === "pending") order.status = "confirmed";
    order.updatedAt = new Date().toISOString();

    await updateDoc(docRef, {
      paymentStatus: order.paymentStatus,
      status: order.status,
      updatedAt: order.updatedAt,
    });

    return order;
  } catch (error) {
    console.error(`Error marking order ${id} as paid in Firestore:`, error);
    return undefined;
  }
}

export async function clearKitchenAck(id: string): Promise<Order | undefined> {
  try {
    const order = await getOrder(id);
    if (!order) return undefined;
    order.needsKitchenAck = false;
    order.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, ORDERS_COLLECTION, id), {
      needsKitchenAck: false,
      updatedAt: order.updatedAt,
    });
    return order;
  } catch (error) {
    console.error(`Error clearing kitchen ack for ${id}:`, error);
    return undefined;
  }
}

/** Delete a single order document (used by test cleanup). */
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    return false;
  }
}

/**
 * Delete every order tagged `isTest: true`.
 * Prefer indexed query; fall back to scanning listOrders if the index is missing.
 */
export async function deleteTestOrders(): Promise<number> {
  let deleted = 0;

  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where("isTest", "==", true),
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      deleted++;
    }
    return deleted;
  } catch (error) {
    console.warn(
      "Indexed isTest query failed; falling back to full scan:",
      error,
    );
  }

  const all = await listOrders();
  for (const order of all) {
    if (order.isTest) {
      if (await deleteOrder(order.id)) deleted++;
    }
  }
  return deleted;
}

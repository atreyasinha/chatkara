import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { randomUUID } from "crypto";
import { RESTAURANT } from "./restaurant";
import type { CartItem, Order, OrderStatus, PaymentMethod } from "./types";

const ORDERS_COLLECTION = "orders";

/**
 * Retrieve all orders from Firestore, ordered by creation date (newest first).
 * Standard queries are used here to retrieve standard collections of documents from Firestore on the server side.
 */
export async function listOrders(): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const results: Order[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Order;
      results.push({
        ...data,
        id: data.id || doc.id,
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
}): Promise<Order> {
  const now = new Date().toISOString();

  // Check if we should append to an existing active order
  if (input.parentOrderId) {
    try {
      const parentOrder = await getOrder(input.parentOrderId);
      if (
        parentOrder &&
        parentOrder.status !== "served" &&
        parentOrder.status !== "cancelled" &&
        parentOrder.paymentStatus !== "paid"
      ) {
        // Merge items (aggregate quantities of duplicate items)
        const mergedItems = [...parentOrder.items];
        for (const newItem of input.items) {
          const existing = mergedItems.find(
            (i) => i.itemId === newItem.itemId && i.notes === newItem.notes
          );
          if (existing) {
            existing.quantity += newItem.quantity;
          } else {
            mergedItems.push(newItem);
          }
        }

        const subtotal = mergedItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0,
        );
        const gst = Math.round((subtotal * RESTAURANT.gstPercent) / 100);
        const total = subtotal + gst;

        const updatedOrder: Order = {
          ...parentOrder,
          items: mergedItems,
          subtotal,
          gst,
          total,
          status: "pending", // Reset to pending to alert the kitchen
          updatedAt: now,
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
      console.error("Failed to append to parent order, fallback to new order:", err);
    }
  }

  // Fallback: Create a new order
  const id = randomUUID();
  const subtotal = input.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const gst = Math.round((subtotal * RESTAURANT.gstPercent) / 100);
  const total = subtotal + gst;

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

/**
 * Update the kitchen status of an order.
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | undefined> {
  try {
    const order = await getOrder(id);
    if (!order) return undefined;

    order.status = status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      status: order.status,
    };

    if (status === "served") {
      const nowStr = new Date().toISOString();
      order.completedAt = nowStr;
      updates.completedAt = nowStr;
    }

    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, updates);
    return order;
  } catch (error) {
    console.error(`Error updating status for order ${id} in Firestore:`, error);
    return undefined;
  }
}

/**
 * Mark an order payment status as paid, updating kitchen status if necessary.
 */
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

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
      results.push(doc.data() as Order);
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
      return docSnap.data() as Order;
    }
    return undefined;
  } catch (error) {
    console.error(`Error getting order ${id} from Firestore:`, error);
    return undefined;
  }
}

/**
 * Write a new order to the Firestore database.
 */
export async function createOrder(input: {
  tableNumber: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}): Promise<Order> {
  const id = randomUUID();
  const subtotal = input.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const gst = Math.round((subtotal * RESTAURANT.gstPercent) / 100);
  const total = subtotal + gst;
  const now = new Date().toISOString();

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
    await setDoc(docRef, order);
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
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    const order = docSnap.data() as Order;
    order.status = status;
    order.updatedAt = new Date().toISOString();

    await updateDoc(docRef, {
      status: order.status,
      updatedAt: order.updatedAt,
    });

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

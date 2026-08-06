import fs from "fs";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase.ts";
import { MENU } from "../src/lib/menu.ts";
import type { Order, CartItem } from "../src/lib/types.ts";
import { randomUUID } from "crypto";

async function main() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("FIREBASE_PROJECT_ID missing.");
    process.exit(1);
  }

  const csvContent = fs.readFileSync("orders_to_upload.csv", "utf-8");
  const lines = csvContent.split("\n").filter(l => l.trim() !== "");
  const headers = lines[0].split(",");
  
  const records = lines.slice(1).map(line => {
    const values = line.split(",");
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h.trim()] = values[i] ? values[i].trim() : "";
    });
    return record;
  });

  const ordersByGroupId = new Map<string, Record<string, string>[]>();
  
  for (const record of records) {
    const groupId = record.Order_ID;
    if (!groupId) continue;
    if (!ordersByGroupId.has(groupId)) {
      ordersByGroupId.set(groupId, []);
    }
    ordersByGroupId.get(groupId)!.push(record);
  }

  console.log(`Found ${ordersByGroupId.size} unique orders to upload.`);

  let tableNumberCounter = 1;
  let count = 0;
  for (const [orderId, rows] of ordersByGroupId.entries()) {
    const items: CartItem[] = [];
    let subtotal = 0;
    
    // Pick the date from the first row of this order
    const dateStr = rows[0].Date; 
    let createdAt = new Date().toISOString();
    if (dateStr) {
       // Convert YYYY-MM-DD to ISO
       createdAt = new Date(dateStr).toISOString();
    }
    
    for (const row of rows) {
      const matchedName = row.Matched_Menu_Item;
      const menuItem = MENU.find((m) => m.name.toUpperCase() === matchedName.toUpperCase());
      
      const quantity = parseFloat(row.Quantity) || 1;
      const price = parseFloat(row.Unit_Price_Calculated) || parseFloat(row.Menu_Price) || 0;
      
      items.push({
        itemId: menuItem?.id || randomUUID(),
        name: matchedName || row.Original_Item,
        price: price,
        quantity: quantity,
        veg: menuItem?.veg || "veg",
      });
      
      subtotal += price * quantity;
    }
    
    const order: Order = {
      id: orderId,
      tableNumber: tableNumberCounter++, 
      items,
      subtotal,
      gst: 0,
      total: subtotal,
      paymentMethod: "cash",
      paymentStatus: "paid",
      status: "served",
      createdAt,
      updatedAt: createdAt,
      completedAt: createdAt,
      isTest: true, 
    };

    try {
      const docRef = doc(db, "orders", order.id);
      await setDoc(docRef, order);
      console.log(`Uploaded order ${order.id}`);
      count++;
    } catch (err) {
      console.error(`Failed to upload ${order.id}:`, err);
    }
  }

  console.log(`Successfully uploaded ${count} orders.`);
  process.exit(0);
}

main().catch(console.error);

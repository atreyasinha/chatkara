import fs from "fs";
import { MENU } from "../src/lib/menu.ts";

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

const missingItems = new Map();

for (const record of records) {
  const matchedName = record.Matched_Menu_Item;
  if (!matchedName) continue;
  
  const menuItem = MENU.find((m) => m.name.toUpperCase() === matchedName.toUpperCase());
  if (!menuItem) {
    if (!missingItems.has(matchedName)) {
      missingItems.set(matchedName, { price: record.Menu_Price, veg: "veg", original: record.Original_Item });
    }
  }
}

console.log("Missing items:");
for (const [name, info] of missingItems.entries()) {
  console.log(`- ${name} (Price: ${info.price}, Original: ${info.original})`);
}

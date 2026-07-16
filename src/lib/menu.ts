import type { MenuItem, VegFlag } from "./types";

function item(
  id: string,
  name: string,
  price: number,
  category: string,
  veg: VegFlag,
  subcategory?: string,
  popular?: boolean,
): MenuItem {
  return { id, name, price, category, veg, subcategory, popular };
}

/**
 * Prices are estimates for a mid-range restaurant in Bokaro, Jharkhand.
 * Adjust in this file (or later via admin) to match your actual rates.
 */
export const MENU: MenuItem[] = [
  // —— Soups ——
  item("soup-veg-clear", "Veg Clear Soup", 99, "Soups", "veg", "Veg Soups"),
  item("soup-veg-sweet-corn", "Veg Sweet Corn Soup", 119, "Soups", "veg", "Veg Soups"),
  item("soup-veg-hot-sour", "Veg Hot & Sour Soup", 129, "Soups", "veg", "Veg Soups", true),
  item("soup-veg-noodle", "Veg Noodle Soup", 129, "Soups", "veg", "Veg Soups"),
  item("soup-tomato", "Tomato Soup", 109, "Soups", "veg", "Veg Soups"),
  item("soup-veg-mushroom", "Veg Mushroom Soup", 129, "Soups", "veg", "Veg Soups"),
  item("soup-chicken-clear", "Chicken Clear Soup", 139, "Soups", "nonveg", "Chicken Soups"),
  item("soup-chicken-sweet-corn", "Chicken Sweet Corn Soup", 149, "Soups", "nonveg", "Chicken Soups"),
  item("soup-chicken-hot-sour", "Chicken Hot & Sour Soup", 159, "Soups", "nonveg", "Chicken Soups", true),
  item("soup-chicken-mushroom", "Chicken Mushroom Soup", 159, "Soups", "nonveg", "Chicken Soups"),

  // —— Veg Starters ——
  item("st-paneer-chilli", "Paneer Chilli", 199, "Garden Starters", "veg", "Veg Starters", true),
  item("st-paneer-chilli-gravy", "Paneer Chilli Gravy", 219, "Garden Starters", "veg", "Veg Starters"),
  item("st-paneer-65", "Paneer 65", 209, "Garden Starters", "veg", "Veg Starters", true),
  item("st-baby-corn-chilli", "Baby Corn Chilli", 179, "Garden Starters", "veg", "Veg Starters"),
  item("st-mushroom-chilli", "Mushroom Chilli", 189, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-chilli", "Veg Chilli", 169, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-manchurian", "Veg Manchurian", 179, "Garden Starters", "veg", "Veg Starters", true),
  item("st-veg-crispy", "Veg Crispy", 179, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-sweet-sour", "Veg Sweet & Sour", 179, "Garden Starters", "veg", "Veg Starters"),
  item("st-soya-chilli", "Soya Chilli", 169, "Garden Starters", "veg", "Veg Starters"),
  item("st-corn-salt-pepper", "American Corn Salt & Pepper", 169, "Garden Starters", "veg", "Veg Starters"),
  item("st-crispy-chilli-potato", "Crispy Chilli Potato", 159, "Garden Starters", "veg", "Veg Starters", true),
  item("st-veg-lollipop", "Veg Lollipop", 179, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-ball", "Veg Ball", 159, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-cheese-ball", "Veg Cheese Ball", 189, "Garden Starters", "veg", "Veg Starters"),
  item("st-veg-chopsy", "Veg Chopsy", 169, "Garden Starters", "veg", "Veg Starters"),

  // —— Nonveg Starters ——
  item("st-chicken-chilli", "Chicken Chilli", 249, "Garden Starters", "nonveg", "Nonveg Starters", true),
  item("st-chicken-chilli-gravy", "Chicken Chilli Gravy", 269, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-boneless-chilli", "Chicken Boneless Chilli", 279, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-boneless-chilli-gravy", "Chicken Boneless Chilli Gravy", 289, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-manchurian", "Chicken Manchurian", 259, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-65", "Chicken 65", 259, "Garden Starters", "nonveg", "Nonveg Starters", true),
  item("st-chicken-sweet-sour", "Chicken Sweet & Sour", 259, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-crispy", "Chicken Crispy", 269, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-salt-pepper", "Chicken Salt & Pepper", 259, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-garlic-chicken", "Garlic Chicken", 269, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-pakoda", "Chicken Pakoda", 229, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-badami", "Chicken Badami", 289, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-spring-roll", "Chicken Spring Roll", 219, "Garden Starters", "nonveg", "Nonveg Starters"),
  item("st-chicken-lollipop", "Chicken Lollipop", 279, "Garden Starters", "nonveg", "Nonveg Starters", true),

  // —— Tandoori ——
  item("tan-full-chicken", "Full Tandoori Chicken", 449, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-chicken-tikka", "Chicken Tikka", 299, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-hariyali-tikka", "Chicken Hariyali Tikka", 309, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-reshmi", "Chicken Reshmi Kebab", 319, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-afghani", "Chicken Afghani Kebab", 329, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-malai", "Chicken Malai Kebab", 329, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-boti", "Chicken Boti Kebab", 299, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-lasooni", "Chicken Lasooni Kebab", 309, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-kali-mirch", "Chicken Kali Mirch Kebab", 309, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-leg", "Chicken Leg Kebab", 289, "Treasures of the Tandoor", "nonveg", "Tandoori"),

  // —— Pizza ——
  item("piz-veg", "Veg Pizza", 189, "Pizza Paradise", "veg", undefined, true),
  item("piz-cheese", "Cheese Pizza", 199, "Pizza Paradise", "veg"),
  item("piz-corn-cheese", "Corn Cheese Pizza", 219, "Pizza Paradise", "veg"),
  item("piz-paneer", "Paneer Pizza", 249, "Pizza Paradise", "veg", undefined, true),
  item("piz-peri-peri", "Peri Peri Cheese Pizza", 259, "Pizza Paradise", "veg"),
  item("piz-garden", "Pizza Garden", 269, "Pizza Paradise", "veg"),
  item("piz-double-cheese", "Double Cheese Pizza", 279, "Pizza Paradise", "veg"),
  item("piz-family", "Family Pizza", 449, "Pizza Paradise", "veg", undefined, true),

  // —— Italian ——
  item("it-au-gratin", "Au Gratin", 229, "Italian Kitchen", "veg"),
  item("it-veg-lasagna", "Veg Lasagna", 249, "Italian Kitchen", "veg", undefined, true),
  item("it-bread-lasagna", "Bread Lasagna", 229, "Italian Kitchen", "veg"),
  item("it-chicken-lasagna", "Chicken Lasagna", 289, "Italian Kitchen", "nonveg", undefined, true),

  // —— Noodles ——
  item("nd-veg-chowmein", "Veg Chow Mein", 149, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-hakka", "Hakka Noodles", 159, "Wok & Noodle Station", "veg", "Vegetarian", true),
  item("nd-schezwan", "Schezwan Noodles", 169, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-paneer", "Paneer Noodles", 189, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-mix-veg", "Mix Veg Noodles", 169, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-egg-chowmein", "Egg Chow Mein", 169, "Wok & Noodle Station", "egg", "Non-Vegetarian"),
  item("nd-chicken-chowmein", "Chicken Chow Mein", 199, "Wok & Noodle Station", "nonveg", "Non-Vegetarian", true),
  item("nd-chicken-mix", "Chicken Mix Chow Mein", 219, "Wok & Noodle Station", "nonveg", "Non-Vegetarian"),

  // —— South Indian ——
  item("si-idli", "Idli", 79, "South Indian Corner", "veg"),
  item("si-uttapam", "Uttapam", 99, "South Indian Corner", "veg"),
  item("si-masala-dosa", "Masala Dosa", 119, "South Indian Corner", "veg", undefined, true),
  item("si-curd-rice", "Curd Rice", 99, "South Indian Corner", "veg"),

  // —— Rolls ——
  item("rl-veg", "Veg Roll", 79, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-veg-cheese", "Veg Cheese Roll", 99, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-paneer", "Paneer Roll", 119, "Rolls & Wraps", "veg", "Vegetarian", true),
  item("rl-chilli-paneer", "Chilli Paneer Roll", 129, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-paneer-tikka", "Paneer Tikka Roll", 139, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-egg", "Egg Roll", 89, "Rolls & Wraps", "egg", "Non-Vegetarian"),
  item("rl-double-egg", "Double Egg Roll", 109, "Rolls & Wraps", "egg", "Non-Vegetarian"),
  item("rl-chicken", "Chicken Roll", 129, "Rolls & Wraps", "nonveg", "Non-Vegetarian", true),
  item("rl-chicken-egg", "Chicken Egg Roll", 149, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-double-chicken-egg", "Double Chicken Egg Roll", 169, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-chicken-cheese", "Chicken Cheese Roll", 159, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-chicken-tikka", "Chicken Tikka Roll", 169, "Rolls & Wraps", "nonveg", "Non-Vegetarian", true),
  item("rl-chilli-chicken", "Chilli Chicken Roll", 159, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),

  // —— Evening Snacks ——
  item("sn-samosa", "Samosa", 40, "Evening Snacks", "veg", undefined, true),
  item("sn-veg-pakoda", "Veg Pakoda", 89, "Evening Snacks", "veg"),
  item("sn-onion-pakoda", "Onion Pakoda", 79, "Evening Snacks", "veg"),
  item("sn-paneer-pakoda", "Paneer Pakoda", 129, "Evening Snacks", "veg"),
  item("sn-chicken-pakoda", "Chicken Pakoda", 149, "Evening Snacks", "nonveg"),
  item("sn-veg-cutlet", "Veg Cutlet", 99, "Evening Snacks", "veg"),
  item("sn-french-fries", "French Fries", 99, "Evening Snacks", "veg", undefined, true),
  item("sn-maggi", "Maggi", 79, "Evening Snacks", "veg"),
  item("sn-dhokla", "Dhokla", 89, "Evening Snacks", "veg"),
  item("sn-chole-bhature", "Chole Bhature", 149, "Evening Snacks", "veg", undefined, true),

  // —— Sandwiches & Egg ——
  item("sw-veg", "Veg Sandwich", 89, "Sandwiches", "veg"),
  item("sw-cheese", "Cheese Sandwich", 109, "Sandwiches", "veg"),
  item("sw-club", "Club Sandwich", 149, "Sandwiches", "veg", undefined, true),
  item("sw-chicken", "Chicken Sandwich", 159, "Sandwiches", "nonveg"),
  item("sw-french-toast", "French Toast", 99, "Sandwiches", "veg"),
  item("eg-pouch", "Egg Pouch", 89, "Egg", "egg"),
  item("eg-omelette", "Omelette", 79, "Egg", "egg"),

  // —— Paneer Collection ——
  item("pn-butter-masala", "Paneer Butter Masala", 249, "Royal Paneer Collection", "veg", undefined, true),
  item("pn-masala", "Paneer Masala", 229, "Royal Paneer Collection", "veg"),
  item("pn-shahi", "Shahi Paneer", 259, "Royal Paneer Collection", "veg", undefined, true),
  item("pn-do-pyaza", "Paneer Do Pyaza", 239, "Royal Paneer Collection", "veg"),
  item("pn-bharta", "Paneer Bharta", 239, "Royal Paneer Collection", "veg"),
  item("pn-tikka-butter", "Paneer Tikka Butter Masala", 269, "Royal Paneer Collection", "veg", undefined, true),
  item("pn-lababdar", "Paneer Lababdar", 259, "Royal Paneer Collection", "veg"),
  item("pn-kadai", "Paneer Kadai", 249, "Royal Paneer Collection", "veg"),
  item("pn-shahi-korma", "Paneer Shahi Korma", 269, "Royal Paneer Collection", "veg"),
  item("pn-navratan-korma", "Paneer Navratan Korma", 269, "Royal Paneer Collection", "veg"),
  item("pn-mushroom", "Paneer Mushroom", 249, "Royal Paneer Collection", "veg"),
  item("pn-tadka", "Paneer Tadka", 239, "Royal Paneer Collection", "veg"),
  item("pn-palak", "Palak Paneer", 239, "Royal Paneer Collection", "veg", undefined, true),

  // —— Veg Delights ——
  item("vg-malai-kofta", "Malai Kofta", 249, "Garden Fresh Vegetarian", "veg", undefined, true),
  item("vg-veg-kofta", "Veg Kofta", 219, "Garden Fresh Vegetarian", "veg"),
  item("vg-nargisi-kofta", "Nargisi Kofta", 239, "Garden Fresh Vegetarian", "veg"),
  item("vg-navratan-korma", "Navratan Korma", 239, "Garden Fresh Vegetarian", "veg"),
  item("vg-jaipuri", "Veg Jaipuri", 219, "Garden Fresh Vegetarian", "veg"),
  item("vg-jalfrezi", "Veg Jalfrezi", 209, "Garden Fresh Vegetarian", "veg"),
  item("vg-garden-masala", "Veg Garden Masala", 209, "Garden Fresh Vegetarian", "veg"),
  item("vg-keema-masala", "Veg Keema Masala", 199, "Garden Fresh Vegetarian", "veg"),
  item("vg-mix-veg", "Mix Veg", 189, "Garden Fresh Vegetarian", "veg"),
  item("vg-mushroom-butter", "Mushroom Butter Masala", 229, "Garden Fresh Vegetarian", "veg", undefined, true),
  item("vg-mushroom-masala", "Mushroom Masala", 209, "Garden Fresh Vegetarian", "veg"),
  item("vg-baby-corn-masala", "Baby Corn Masala", 199, "Garden Fresh Vegetarian", "veg"),
  item("vg-green-peas", "Green Peas Masala", 179, "Garden Fresh Vegetarian", "veg"),
  item("vg-matar-paneer", "Matar Paneer", 229, "Garden Fresh Vegetarian", "veg", undefined, true),
  item("vg-matar-mushroom", "Matar Mushroom", 209, "Garden Fresh Vegetarian", "veg"),
  item("vg-aloo-dum", "Aloo Dum", 169, "Garden Fresh Vegetarian", "veg"),
  item("vg-aloo-dum-kashmiri", "Aloo Dum Kashmiri", 189, "Garden Fresh Vegetarian", "veg"),
  item("vg-aloo-gobhi", "Aloo Gobhi Masala", 169, "Garden Fresh Vegetarian", "veg"),
  item("vg-aloo-matar", "Aloo Matar", 159, "Garden Fresh Vegetarian", "veg"),
  item("vg-aloo-palak", "Aloo Palak", 169, "Garden Fresh Vegetarian", "veg"),
  item("vg-bhindi", "Bhindi Masala", 179, "Garden Fresh Vegetarian", "veg"),
  item("vg-chana", "Chana Masala", 169, "Garden Fresh Vegetarian", "veg"),
  item("vg-baingan", "Baingan Bharta", 179, "Garden Fresh Vegetarian", "veg"),

  // —— Dal ——
  item("dal-fry", "Dal Fry", 149, "Dal Specialties", "veg"),
  item("dal-butter", "Dal Butter", 159, "Dal Specialties", "veg"),
  item("dal-tadka", "Dal Tadka", 159, "Dal Specialties", "veg", undefined, true),
  item("dal-butter-tadka", "Butter Tadka", 169, "Dal Specialties", "veg"),
  item("dal-makhani", "Dal Makhani", 199, "Dal Specialties", "veg", undefined, true),

  // —— Egg Curries ——
  item("egg-bhujia", "Egg Bhujia", 149, "Egg Delights", "egg"),
  item("egg-curry", "Egg Curry", 159, "Egg Delights", "egg", undefined, true),
  item("egg-masala", "Egg Masala", 169, "Egg Delights", "egg"),
  item("egg-do-pyaza", "Egg Do Pyaza", 169, "Egg Delights", "egg"),
  item("egg-butter-masala", "Egg Butter Masala", 179, "Egg Delights", "egg"),
  item("egg-tadka", "Egg Tadka", 159, "Egg Delights", "egg"),
  item("egg-butter-tadka", "Egg Butter Tadka", 169, "Egg Delights", "egg"),

  // —— Mutton ——
  item("mt-curry", "Mutton Curry", 349, "Royal Mutton Collection", "nonveg", undefined, true),
  item("mt-masala", "Mutton Masala", 359, "Royal Mutton Collection", "nonveg"),
  item("mt-do-pyaza", "Mutton Do Pyaza", 359, "Royal Mutton Collection", "nonveg"),
  item("mt-rogan-josh", "Mutton Rogan Josh", 379, "Royal Mutton Collection", "nonveg", undefined, true),
  item("mt-kassa", "Mutton Kassa", 369, "Royal Mutton Collection", "nonveg"),

  // —— Chicken Curries ——
  item("ck-curry", "Chicken Curry", 259, "Chef's Signature Chicken", "nonveg"),
  item("ck-masala", "Chicken Masala", 269, "Chef's Signature Chicken", "nonveg"),
  item("ck-butter-masala", "Chicken Butter Masala", 289, "Chef's Signature Chicken", "nonveg", undefined, true),
  item("ck-kadai", "Chicken Kadai", 279, "Chef's Signature Chicken", "nonveg"),
  item("ck-handi", "Chicken Handi", 289, "Chef's Signature Chicken", "nonveg"),
  item("ck-tikka-butter", "Chicken Tikka Butter Masala", 309, "Chef's Signature Chicken", "nonveg", undefined, true),
  item("ck-punjabi", "Chicken Punjabi Masala", 289, "Chef's Signature Chicken", "nonveg"),
  item("ck-do-pyaza", "Chicken Do Pyaza", 279, "Chef's Signature Chicken", "nonveg"),
  item("ck-kali-mirch", "Chicken Kali Mirch Masala", 289, "Chef's Signature Chicken", "nonveg"),
  item("ck-bharta", "Chicken Bharta", 289, "Chef's Signature Chicken", "nonveg"),
  item("ck-lababdar", "Chicken Lababdar", 299, "Chef's Signature Chicken", "nonveg"),
  item("ck-patiala", "Chicken Patiala", 309, "Chef's Signature Chicken", "nonveg"),
  item("ck-prabhat", "Chicken Prabhat Special", 329, "Chef's Signature Chicken", "nonveg", undefined, true),

  // —— Fish ——
  item("fs-curry", "Fish Curry", 289, "Fish Specialties", "nonveg", undefined, true),
  item("fs-masala", "Fish Masala", 299, "Fish Specialties", "nonveg"),
  item("fs-do-pyaza", "Fish Do Pyaza", 299, "Fish Specialties", "nonveg"),
];

export const CATEGORIES = Array.from(
  new Set(MENU.map((m) => m.category)),
);

export function getMenuItem(id: string): MenuItem | undefined {
  return MENU.find((m) => m.id === id);
}

export function searchMenu(query: string): MenuItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return MENU;
  return MENU.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      (m.subcategory?.toLowerCase().includes(q) ?? false),
  );
}

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
 * ChatKara Official Menu Items and Prices
 * Extracted directly from the official PDF menu.
 */
export const MENU: MenuItem[] = [
  // —— SOUPS (Page 1 in PDF / page index 3) ——
  item("soup-veg-clear", "Veg Clear Soup", 90, "Soups", "veg", "Veg Soups"),
  item("soup-veg-sweet-corn", "Veg Sweet Corn Soup", 120, "Soups", "veg", "Veg Soups"),
  item("soup-veg-hot-sour", "Veg Hot & Sour Soup", 110, "Soups", "veg", "Veg Soups", true),
  item("soup-veg-noodle", "Veg Noodle Soup", 120, "Soups", "veg", "Veg Soups"),
  item("soup-tomato", "Tomato Soup", 90, "Soups", "veg", "Veg Soups"),
  item("soup-veg-mushroom", "Veg Mushroom Soup", 110, "Soups", "veg", "Veg Soups"),
  item("soup-lemon-coriander", "Lemon Coriander Soup", 100, "Soups", "veg", "Veg Soups"),

  item("soup-chicken-clear", "Chicken Clear Soup", 120, "Soups", "nonveg", "Chicken Soups"),
  item("soup-chicken-sweet-corn", "Chicken Sweet Corn Soup", 130, "Soups", "nonveg", "Chicken Soups"),
  item("soup-chicken-hot-sour", "Chicken Hot & Sour Soup", 130, "Soups", "nonveg", "Chicken Soups", true),
  item("soup-chicken-mushroom", "Chicken Mushroom Soup", 130, "Soups", "nonveg", "Chicken Soups"),
  item("soup-chicken-coriander", "Chicken Coriander Soup", 130, "Soups", "nonveg", "Chicken Soups"),

  // —— GARDEN STARTERS (Page 1-2 in PDF / page index 3-4) ——
  // Vegetarian Starters
  item("st-paneer-chilli", "Paneer Chilli", 220, "Garden Starters", "veg", "Vegetarian Starters", true),
  item("st-paneer-chilli-gravy", "Paneer Chilli Gravy", 220, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-paneer-65", "Paneer 65", 230, "Garden Starters", "veg", "Vegetarian Starters", true),
  item("st-baby-corn-chilli", "Baby Corn Chilli", 220, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-mushroom-chilli", "Mushroom Chilli", 220, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-veg-chilli", "Veg Chilli", 150, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-veg-manchurian", "Veg Manchurian", 140, "Garden Starters", "veg", "Vegetarian Starters", true),
  item("st-veg-crispy", "Veg Crispy", 180, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-soya-chilli", "Soya Chilli", 120, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-corn-salt-pepper", "American Corn Salt & Pepper", 160, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-crispy-chilli-potato", "Crispy Chilli Potato", 150, "Garden Starters", "veg", "Vegetarian Starters", true),
  item("st-veg-lollipop", "Veg Lollipop", 160, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-veg-ball", "Veg Ball", 120, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-veg-cheese-ball", "Veg Cheese Ball", 220, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-veg-chopsy", "Veg Chopsy", 220, "Garden Starters", "veg", "Vegetarian Starters"),
  item("st-peanut-masala", "Peanut Masala", 80, "Garden Starters", "veg", "Vegetarian Starters"),

  // Non-Vegetarian Starters
  item("st-chicken-chilli", "Chicken Chilli", 180, "Garden Starters", "nonveg", "Non-Vegetarian Starters", true),
  item("st-chicken-chilli-gravy", "Chicken Chilli Gravy", 200, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-boneless-chilli", "Chicken Boneless Chilli", 220, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-boneless-chilli-gravy", "Chicken Boneless Chilli Gravy", 220, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-manchurian", "Chicken Manchurian", 230, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-65", "Chicken 65", 230, "Garden Starters", "nonveg", "Non-Vegetarian Starters", true),
  item("st-chicken-crispy", "Chicken Crispy", 230, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-salt-pepper", "Chicken Salt & Pepper", 230, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-garlic-chicken", "Garlic Chicken", 250, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-pakoda", "Chicken Pakoda", 180, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-badami", "Chicken Badami", 250, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-spring-roll", "Chicken Spring Roll", 160, "Garden Starters", "nonveg", "Non-Vegetarian Starters"),
  item("st-chicken-lollipop", "Chicken Lollipop", 250, "Garden Starters", "nonveg", "Non-Vegetarian Starters", true),

  // —— TREASURES OF THE TANDOOR (Page 3 in PDF / page index 5) ——
  item("tan-tandoori-chicken-half", "Tandoori Chicken (Half)", 190, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-tandoori-chicken-full", "Tandoori Chicken (Full)", 380, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-chicken-tikka", "Chicken Tikka", 220, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-hariyali-tikka", "Chicken Hariyali Tikka", 250, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-reshmi", "Chicken Reshmi Kebab", 260, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-afghani-half", "Chicken Afghani Kebab (Half)", 160, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-afghani-full", "Chicken Afghani Kebab (Full)", 300, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-malai", "Chicken Malai Kebab", 260, "Treasures of the Tandoor", "nonveg", "Tandoori", true),
  item("tan-boti", "Chicken Boti Kebab", 220, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-lasooni", "Chicken Lasooni Kebab", 230, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-kali-mirch", "Chicken Kali Mirch Kebab", 250, "Treasures of the Tandoor", "nonveg", "Tandoori"),
  item("tan-leg", "Chicken Leg Kebab", 260, "Treasures of the Tandoor", "nonveg", "Tandoori"),

  // —— PIZZA PARADISE (Page 3 in PDF / page index 5) ——
  item("piz-veg", "Veg Pizza", 180, "Pizza Paradise", "veg", undefined, true),
  item("piz-cheese", "Cheese Pizza", 220, "Pizza Paradise", "veg"),
  item("piz-corn-cheese", "Corn Cheese Pizza", 200, "Pizza Paradise", "veg"),
  item("piz-paneer", "Paneer Pizza", 200, "Pizza Paradise", "veg", undefined, true),
  item("piz-peri-peri", "Peri Peri Cheese Pizza", 220, "Pizza Paradise", "veg"),
  item("piz-garden", "Pizza Garden", 230, "Pizza Paradise", "veg"),
  item("piz-double-cheese", "Double Cheese Pizza", 250, "Pizza Paradise", "veg"),
  item("piz-family", "Family Pizza", 500, "Pizza Paradise", "veg", undefined, true),

  // —— ITALIAN KITCHEN (Page 4 in PDF / page index 6) ——
  item("it-au-gratin", "Au Gratin", 320, "Italian Kitchen", "veg"),
  item("it-veg-lasagna", "Veg Lasagna", 300, "Italian Kitchen", "veg", undefined, true),
  item("it-chicken-lasagna", "Chicken Lasagna", 350, "Italian Kitchen", "nonveg", undefined, true),
  item("it-white-sauce-pasta", "White Sauce Pasta", 220, "Italian Kitchen", "veg"),
  item("it-mix-sauce-pasta", "Mix Sauce Pasta", 200, "Italian Kitchen", "veg"),
  item("it-garlic-bread", "Garlic Bread", 200, "Italian Kitchen", "veg"),

  // —— WOK & NOODLE STATION (Page 4 in PDF / page index 6) ——
  // Vegetarian
  item("nd-veg-chowmein", "Veg Chow Mein", 120, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-hakka", "Hakka Noodles", 120, "Wok & Noodle Station", "veg", "Vegetarian", true),
  item("nd-schezwan", "Schezwan Noodles", 150, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-paneer", "Paneer Noodles", 220, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-mix-veg", "Mix Veg Noodles", 180, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-chinese-bhel", "Chinese Bhel", 160, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-chilli-garlic", "Chilli Garlic Noodles", 150, "Wok & Noodle Station", "veg", "Vegetarian"),
  item("nd-special-noodles", "Chatkara Special Noodles", 200, "Wok & Noodle Station", "veg", "Vegetarian"),
  // Non-Vegetarian
  item("nd-egg-chowmein", "Egg Chow Mein", 160, "Wok & Noodle Station", "egg", "Non-Vegetarian"),
  item("nd-chicken-chowmein", "Chicken Chow Mein", 220, "Wok & Noodle Station", "nonveg", "Non-Vegetarian", true),
  item("nd-chicken-mix", "Chicken Mix Chow Mein", 250, "Wok & Noodle Station", "nonveg", "Non-Vegetarian"),

  // —— ROLLS & WRAPS (Page 5 in PDF / page index 7) ——
  // Vegetarian
  item("rl-veg", "Veg Roll", 60, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-paneer", "Paneer Roll", 100, "Rolls & Wraps", "veg", "Vegetarian", true),
  item("rl-chilli-paneer", "Chilli Paneer Roll", 120, "Rolls & Wraps", "veg", "Vegetarian"),
  item("rl-paneer-tikka", "Paneer Tikka Roll", 130, "Rolls & Wraps", "veg", "Vegetarian"),
  // Non-Vegetarian
  item("rl-egg", "Egg Roll", 70, "Rolls & Wraps", "egg", "Non-Vegetarian"),
  item("rl-double-egg", "Double Egg Roll", 80, "Rolls & Wraps", "egg", "Non-Vegetarian"),
  item("rl-chicken", "Chicken Roll", 120, "Rolls & Wraps", "nonveg", "Non-Vegetarian", true),
  item("rl-chicken-egg", "Chicken Egg Roll", 130, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-double-egg-chicken", "Double Egg Chicken Roll", 150, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-chicken-cheese", "Chicken Cheese Roll", 140, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),
  item("rl-chicken-tikka", "Chicken Tikka Roll", 150, "Rolls & Wraps", "nonveg", "Non-Vegetarian", true),
  item("rl-chilli-chicken", "Chilli Chicken Roll", 140, "Rolls & Wraps", "nonveg", "Non-Vegetarian"),

  // —— SOUTH INDIAN CORNER (Page 5 in PDF / page index 7) ——
  item("si-idli", "Idli", 40, "South Indian Corner", "veg", "Vegetarian"),
  item("si-uttapam", "Uttapam", 80, "South Indian Corner", "veg", "Vegetarian"),
  item("si-masala-dosa", "Masala Dosa", 70, "South Indian Corner", "veg", "Vegetarian", true),
  item("si-curd-rice", "Curd Rice", 100, "South Indian Corner", "veg", "Vegetarian"),

  // —— SANDWICHES (Page 6 in PDF / page index 8) ——
  item("sw-veg", "Veg Sandwich", 120, "Sandwiches", "veg"),
  item("sw-cheese", "Cheese Sandwich", 149, "Sandwiches", "veg"),
  item("sw-club", "Club Sandwich", 180, "Sandwiches", "veg", undefined, true),
  item("sw-chicken", "Chicken Sandwich", 220, "Sandwiches", "nonveg"),
  item("sw-french-toast", "French Toast", 120, "Sandwiches", "veg"),

  // —— EGG (Page 6 in PDF / page index 8) ——
  item("eg-pouch", "Egg Pouch", 49, "Egg", "egg"),
  item("eg-omelette", "Omelette", 49, "Egg", "egg"),

  // —— ROYAL PANEER COLLECTION (Page 6 in PDF / page index 8) ——
  item("pn-butter-masala", "Paneer Butter Masala", 230, "Royal Paneer Collection", "veg", "Vegetarian", true),
  item("pn-masala", "Paneer Masala", 210, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-shahi", "Shahi Paneer", 249, "Royal Paneer Collection", "veg", "Vegetarian", true),
  item("pn-do-pyaza", "Paneer Do Pyaza", 220, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-bharta", "Paneer Bharta", 230, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-tikka-butter", "Paneer Tikka Butter Masala", 249, "Royal Paneer Collection", "veg", "Vegetarian", true),
  item("pn-lababdar", "Paneer Lababdar", 249, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-kadai", "Paneer Kadai", 220, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-shahi-korma", "Paneer Shahi Korma", 249, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-navratan-korma", "Paneer Navratan Korma", 240, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-mushroom", "Paneer Mushroom", 220, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-tadka", "Paneer Tadka", 180, "Royal Paneer Collection", "veg", "Vegetarian"),
  item("pn-palak", "Palak Paneer", 230, "Royal Paneer Collection", "veg", "Vegetarian", true),

  // —— GARDEN FRESH VEGETARIAN DELIGHTS (Page 7 in PDF / page index 9) ——
  item("vg-malai-kofta", "Malai Kofta", 260, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian", true),
  item("vg-veg-kofta", "Veg Kofta", 149, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-nargisi-kofta", "Nargisi Kofta", 220, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-navratan-korma", "Navratan Korma", 249, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-jaipuri", "Veg Jaipuri", 180, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-jalfrezi", "Veg Jalfrezi", 180, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-garden-masala", "Veg Garden Masala", 230, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-keema-masala", "Veg Keema Masala", 220, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-mix-veg", "Mix Veg", 160, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-mushroom-butter", "Mushroom Butter Masala", 220, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian", true),
  item("vg-mushroom-masala", "Mushroom Masala", 199, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-baby-corn-masala", "Baby Corn Masala", 199, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-green-peas", "Green Peas Masala", 149, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-matar-paneer", "Matar Paneer", 199, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian", true),
  item("vg-matar-mushroom", "Matar Mushroom", 180, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-aloo-dum", "Aloo Dum", 150, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-aloo-dum-kashmiri", "Aloo Dum Kashmiri", 199, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-aloo-gobhi", "Aloo Gobhi Masala", 150, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-aloo-matar", "Aloo Matar", 130, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-bhindi", "Bhindi Masala", 130, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-chana", "Chana Masala", 150, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),
  item("vg-baingan", "Baingan Bharta", 100, "Garden Fresh Vegetarian Delights", "veg", "Vegetarian"),

  // —— DAL SPECIALTIES (Page 8 in PDF / page index 10) ——
  item("dal-fry", "Dal Fry", 120, "Dal Specialties", "veg"),
  item("dal-butter", "Dal Butter", 150, "Dal Specialties", "veg"),
  item("dal-tadka", "Dal Tadka", 160, "Dal Specialties", "veg", undefined, true),
  item("dal-punjabi-tadka", "Punjabi Dal Tadka", 180, "Dal Specialties", "veg"),
  item("dal-makhani", "Dal Makhani", 199, "Dal Specialties", "veg", undefined, true),

  // —— EGG DELIGHTS (Page 8 in PDF / page index 10) ——
  item("egg-bhujia", "Egg Bhujia", 80, "Egg Delights", "egg"),
  item("egg-curry", "Egg Curry", 120, "Egg Delights", "egg", undefined, true),
  item("egg-masala", "Egg Masala", 150, "Egg Delights", "egg"),
  item("egg-do-pyaza", "Egg Do Pyaza", 180, "Egg Delights", "egg"),
  item("egg-tadka", "Egg Tadka", 160, "Egg Delights", "egg"),

  // —— ROYAL MUTTON COLLECTION (Page 8 in PDF / page index 10) ——
  item("mt-curry", "Mutton Curry", 249, "Royal Mutton Collection", "nonveg", undefined, true),
  item("mt-masala", "Mutton Masala", 420, "Royal Mutton Collection", "nonveg"),
  item("mt-do-pyaza", "Mutton Do Pyaza", 299, "Royal Mutton Collection", "nonveg"),
  item("mt-rogan-josh", "Mutton Rogan Josh", 399, "Royal Mutton Collection", "nonveg", undefined, true),
  item("mt-kassa", "Mutton Kassa", 420, "Royal Mutton Collection", "nonveg"),

  // —— CHEF'S SIGNATURE CHICKEN CURRIES (Page 9 in PDF / page index 11) ——
  item("ck-curry", "Chicken Curry", 180, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-masala", "Chicken Masala", 200, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-butter-masala", "Chicken Butter Masala", 300, "Chef's Signature Chicken Curries", "nonveg", undefined, true),
  item("ck-kadai", "Chicken Kadai", 280, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-handi", "Chicken Handi", 300, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-tikka-butter", "Chicken Tikka Butter Masala", 350, "Chef's Signature Chicken Curries", "nonveg", undefined, true),
  item("ck-punjabi", "Chicken Punjabi Masala", 320, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-do-pyaza", "Chicken Do Pyaza", 200, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-kali-mirch", "Chicken Kali Mirch Masala", 320, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-bharta", "Chicken Bharta", 300, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-lababdar", "Chicken Lababdar", 350, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-patiala", "Chicken Patiala", 320, "Chef's Signature Chicken Curries", "nonveg"),
  item("ck-special", "Chatkara Chicken Special", 420, "Chef's Signature Chicken Curries", "nonveg", undefined, true),

  // —— FISH SPECIALTIES (Page 9 in PDF / page index 11) ——
  item("fs-curry", "Fish Curry", 150, "Fish Specialties", "nonveg", undefined, true),
  item("fs-masala", "Fish Masala", 180, "Fish Specialties", "nonveg"),
  item("fs-do-pyaza", "Fish Do Pyaza", 180, "Fish Specialties", "nonveg"),

  // —— RICE & PULAO (Page 10 in PDF / page index 12) ——
  item("rp-steamed", "Steamed Rice", 100, "Rice & Pulao", "veg"),
  item("rp-jeera", "Jeera Rice", 120, "Rice & Pulao", "veg"),
  item("rp-veg-pulao", "Veg Pulao", 150, "Rice & Pulao", "veg"),
  item("rp-paneer-pulao", "Paneer Pulao", 180, "Rice & Pulao", "veg"),
  item("rp-green-peas-pulao", "Green Peas Pulao", 120, "Rice & Pulao", "veg"),
  item("rp-kashmiri-pulao", "Kashmiri Pulao", 200, "Rice & Pulao", "veg"),
  item("rp-fried-rice", "Fried Rice", 160, "Rice & Pulao", "veg"),

  // —— BREADS FROM THE TANDOOR (Page 10 in PDF / page index 12) ——
  item("br-tandoori-roti", "Tandoori Roti", 20, "Breads from the Tandoor", "veg"),
  item("br-butter-tandoori-roti", "Butter Tandoori Roti", 25, "Breads from the Tandoor", "veg"),
  item("br-plain-naan", "Plain Naan", 30, "Breads from the Tandoor", "veg"),
  item("br-butter-naan", "Butter Naan", 40, "Breads from the Tandoor", "veg"),
  item("br-garlic-naan", "Garlic Naan", 50, "Breads from the Tandoor", "veg"),
  item("br-masala-naan", "Masala Naan", 50, "Breads from the Tandoor", "veg"),
  item("br-kashmiri-naan", "Kashmiri Naan", 60, "Breads from the Tandoor", "veg"),
  item("br-stuffed-naan", "Stuffed Naan", 50, "Breads from the Tandoor", "veg"),
  item("br-masala-kulcha", "Masala Kulcha", 50, "Breads from the Tandoor", "veg"),
  item("br-stuffed-kulcha", "Stuffed Kulcha", 50, "Breads from the Tandoor", "veg"),
  item("br-paneer-kulcha", "Paneer Kulcha", 60, "Breads from the Tandoor", "veg"),
  item("br-lachha-paratha", "Lachha Paratha", 30, "Breads from the Tandoor", "veg"),

  // —— ROYAL BIRYANIS (Page 11 in PDF / page index 13) ——
  item("by-veg", "Veg Biryani", 180, "Royal Biryanis", "veg", "Vegetarian"),
  item("by-egg", "Egg Biryani", 200, "Royal Biryanis", "egg", "Non-Vegetarian"),
  item("by-chicken", "Chicken Biryani", 250, "Royal Biryanis", "nonveg", "Non-Vegetarian", true),
  item("by-hyderabadi-chicken", "Hyderabadi Chicken Biryani", 260, "Royal Biryanis", "nonveg", "Non-Vegetarian"),
  item("by-mutton", "Mutton Biryani", 290, "Royal Biryanis", "nonveg", "Non-Vegetarian", true),

  // —— RAITA (Page 11 in PDF / page index 13) ——
  item("rt-plain-curd", "Plain Curd", 60, "Raita", "veg"),
  item("rt-cucumber", "Cucumber Raita", 70, "Raita", "veg"),
  item("rt-boondi", "Boondi Raita", 70, "Raita", "veg"),
  item("rt-pineapple", "Pineapple Raita", 90, "Raita", "veg"),
  item("rt-mixed", "Mixed Raita", 80, "Raita", "veg"),
  item("rt-aloo", "Aloo Raita", 70, "Raita", "veg"),

  // —— SALADS & PAPAD (Page 11 in PDF / page index 13) ——
  item("sl-onion", "Onion Salad", 30, "Salads & Papad", "veg"),
  item("sl-green", "Green Salad", 60, "Salads & Papad", "veg"),
  item("sl-kachumbar", "Kachumbar Salad", 60, "Salads & Papad", "veg"),
  item("sl-dry-papad", "Dry Papad", 15, "Salads & Papad", "veg"),
  item("sl-fried-papad", "Fried Papad", 20, "Salads & Papad", "veg"),
  item("sl-masala-papad", "Masala Papad", 50, "Salads & Papad", "veg"),
  item("sl-peanut-masala", "Peanut Masala", 80, "Salads & Papad", "veg"),

  // —— DESSERTS (Page 12 in PDF / page index 14) ——
  item("ds-gulab-jamun", "Gulab Jamun", 40, "Desserts", "veg"),
  item("ds-vanilla", "Vanilla Ice Cream", 50, "Desserts", "veg"),
  item("ds-butterscotch", "Butterscotch Ice Cream", 50, "Desserts", "veg"),
  item("ds-kesar-pista", "Kesar Pista Ice Cream", 50, "Desserts", "veg"),
  item("ds-choco-bar", "Choco Bar", 100, "Desserts", "veg"),
  item("ds-matka-kulfi", "Matka Kulfi", 45, "Desserts", "veg"),
  item("ds-cornetto", "Cornetto", 40, "Desserts", "veg"),
  item("ds-sugar-free", "Sugar Free Ice Cream", 70, "Desserts", "veg"),
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

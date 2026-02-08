// src/lib/data.ts
export const products = [
  // --- NON KABOB (cat_non_kabob) ---
  { id: 1, name: "Tovuq Go'shtli", price: 25000, image: "/food/tovuq.jpg", category: 'non_kabob' as const },
  { id: 2, name: "Ot Go'shtli", price: 40000, image: "/food/ot.jpg", category: 'non_kabob' as const },
  { id: 3, name: "Mol Go'shtli", price: 35000, image: "/food/mol.jpg", category: 'non_kabob' as const },
  { id: 4, name: "Qo'y Go'shtli", price: 40000, image: "/food/qoy.jpg", category: 'non_kabob' as const },

  // --- TEA (cat_tea) ---
  { id: 10, name: "Qora / Ko'k Choy", price: 3000, image: "/food/qorakokchoy.jpg", category: 'tea' as const },
  { id: 11, name: "Limon Choy", price: 8000, image: "/food/limonchoy.jpg", category: 'tea' as const },
  { id: 12, name: "Malina Limon", price: 10000, image: "/food/malinalimon.jpg", category: 'tea' as const },
  { id: 13, name: "Limon Imbir", price: 12000, image: "/food/limonimbir.jpg", category: 'tea' as const },
  { id: 14, name: "Karak Choy", price: 15000, image: "/food/karakchoy.jpg", category: 'tea' as const },
  { id: 15, name: "Yasmin", price: 8000, image: "/food/yasminchoy.jpg", category: 'tea' as const },

  // --- COFFEE (cat_coffee) ---
  { id: 20, name: "Espresso", price: 9000, image: "/food/ekspresso.jpg", category: 'coffee' as const },
  { id: 21, name: "Americano", price: 15000, image: "/food/americano.jpg", category: 'coffee' as const },
  { id: 22, name: "Cappuccino", price: 20000, image: "/food/cappucino.jpg", category: 'coffee' as const },
  { id: 23, name: "Latte", price: 20000, image: "/food/latte.jpg", category: 'coffee' as const },
  { id: 24, name: "Flat White", price: 25000, image: "/food/flatwhite.jpg", category: 'coffee' as const },

  // --- WATER (cat_waters) ---
  { id: 25, name: "Cola 1 L", price: 12000, image: "/food/cola.jpg", category: 'water' as const },
  { id: 26, name: "Cola 1.5 L", price: 15000, image: "/food/cola.jpg", category: 'water' as const },
  { id: 27, name: "Flash", price: 12000, image: "/food/flash.jpg", category: 'water' as const },
];

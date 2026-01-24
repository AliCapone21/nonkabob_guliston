// app/page.tsx
"use client";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// 1. Define Category Types
type CategoryId = 'non_kabob' | 'tea' | 'coffee';

// 2. Define Products Data (Filenames matched to your screenshot)
const PRODUCTS = [
  // --- NON KABOB ---
  { 
    id: 1, 
    name: "Tovuq Go'shtli", 
    price: 25000, 
    image: "/food/tovuq.jpg", 
    category: 'non_kabob' 
  },
  { 
    id: 2, 
    name: "Ot Go'shtli", 
    price: 35000, 
    image: "/food/ot.jpg", 
    category: 'non_kabob' 
  },
  { 
    id: 3, 
    name: "Mol Go'shtli", 
    price: 40000, 
    image: "/food/mol.jpg", 
    category: 'non_kabob' 
  },
  { 
    id: 4, 
    name: "Qo'y Go'shtli", 
    price: 40000, 
    image: "/food/qoy.jpg", 
    category: 'non_kabob' 
  },

  // --- CHOYLAR (TEAS) ---
  { 
    id: 10, 
    name: "Qora / Ko'k Choy", 
    price: 3000, 
    image: "/food/qorakokchoy.jpg", 
    category: 'tea' 
  },
  { 
    id: 11, 
    name: "Limon Choy", 
    price: 8000, 
    image: "/food/limonchoy.jpg", 
    category: 'tea' 
  },
  { 
    id: 12, 
    name: "Malina Limon", 
    price: 10000, 
    image: "/food/malinalimon.jpg", 
    category: 'tea' 
  },
  { 
    id: 13, 
    name: "Limon Imbir", 
    price: 12000, 
    image: "/food/limonimbir.jpg", 
    category: 'tea' 
  },
  { 
    id: 14, 
    name: "Karak Choy", 
    price: 15000, 
    image: "/food/karakchoy.jpg", 
    category: 'tea' 
  },
  { 
    id: 15, 
    name: "Yasmin", 
    price: 8000, 
    image: "/food/yasminchoy.jpg", 
    category: 'tea' 
  },

  // --- COFFEE ---
  { 
    id: 20, 
    name: "Espresso", 
    price: 9000, 
    image: "/food/ekspresso.jpg", 
    category: 'coffee' 
  },
  { 
    id: 21, 
    name: "Americano", 
    price: 15000, 
    image: "/food/americano.jpg", 
    category: 'coffee' 
  },
  { 
    id: 22, 
    name: "Cappuccino", 
    price: 20000, 
    image: "/food/cappucino.jpg", 
    category: 'coffee' 
  },
  { 
    id: 23, 
    name: "Latte", 
    price: 20000, 
    image: "/food/latte.jpg", 
    category: 'coffee' 
  },
  { 
    id: 24, 
    name: "Flat White", 
    price: 25000, 
    image: "/food/flatwhite.jpg", 
    category: 'coffee' 
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryId>('non_kabob');

  // Define Tabs using Global Translations
  const tabs: { id: CategoryId; label: string }[] = [
    { id: 'non_kabob', label: t.cat_non_kabob },
    { id: 'tea', label: t.cat_tea },
    { id: 'coffee', label: t.cat_coffee },
  ];

  const filteredProducts = PRODUCTS.filter(p => p.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky Header with Scrollable Tabs */}
      <div className="bg-white pt-4 px-4 pb-2 shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
            <div>
                <h1 className="text-xl font-bold text-gray-800">NonKabob Guliston</h1>
                <p className="text-xs text-gray-500">Yetkazib berish • Guliston</p>
            </div>
        </div>
      
        {/* Horizontal Tab Bar */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0
                ${activeTab === tab.id 
                  ? "bg-orange-500 text-white shadow-md transform scale-105" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Empty State Message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">Bu bo'limda mahsulotlar yo'q</p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
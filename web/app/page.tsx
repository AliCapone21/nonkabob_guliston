// app/page.tsx
"use client";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// 1. Define Category Types
type CategoryId = "non_kabob" | "tea" | "coffee";

// 2. Products Data
const PRODUCTS = [
  // --- NON KABOB ---
  { id: 1, name: "Tovuq Go'shtli", price: 25000, image: "/food/tovuq.jpg", category: "non_kabob" },
  { id: 2, name: "Ot Go'shtli", price: 40000, image: "/food/ot.jpg", category: "non_kabob" },
  { id: 3, name: "Mol Go'shtli", price: 35000, image: "/food/mol.jpg", category: "non_kabob" },
  { id: 4, name: "Qo'y Go'shtli", price: 40000, image: "/food/qoy.jpg", category: "non_kabob" },

  // --- TEA ---
  { id: 10, name: "Qora / Ko'k Choy", price: 3000, image: "/food/qorakokchoy.jpg", category: "tea" },
  { id: 11, name: "Limon Choy", price: 8000, image: "/food/limonchoy.jpg", category: "tea" },
  { id: 12, name: "Malina Limon", price: 10000, image: "/food/malinalimon.jpg", category: "tea" },
  { id: 13, name: "Limon Imbir", price: 12000, image: "/food/limonimbir.jpg", category: "tea" },
  { id: 14, name: "Karak Choy", price: 15000, image: "/food/karakchoy.jpg", category: "tea" },
  { id: 15, name: "Yasmin", price: 8000, image: "/food/yasminchoy.jpg", category: "tea" },

  // --- COFFEE ---
  { id: 20, name: "Espresso", price: 9000, image: "/food/ekspresso.jpg", category: "coffee" },
  { id: 21, name: "Americano", price: 15000, image: "/food/americano.jpg", category: "coffee" },
  { id: 22, name: "Cappuccino", price: 20000, image: "/food/cappucino.jpg", category: "coffee" },
  { id: 23, name: "Latte", price: 20000, image: "/food/latte.jpg", category: "coffee" },
  { id: 24, name: "Flat White", price: 25000, image: "/food/flatwhite.jpg", category: "coffee" },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryId>("non_kabob");

  const tabs: { id: CategoryId; label: string }[] = [
    { id: "non_kabob", label: t.cat_non_kabob },
    { id: "tea", label: t.cat_tea },
    { id: "coffee", label: t.cat_coffee },
  ];

  const filteredProducts = PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <main className="min-h-screen bg-gray-50 pb-28">
      {/* ===== HEADER / HERO ===== */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-white to-gray-50">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            NonKabob Guliston
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            🌯 Yetkazib berish • Guliston
          </p>
        </div>

        {/* ===== CATEGORY TABS ===== */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                    ${active
                      ? "bg-orange-500 text-white shadow-md scale-[1.05]"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"}
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== PRODUCT GRID ===== */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* ===== EMPTY STATE ===== */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            🍽️
          </div>
          <p className="text-gray-400 text-sm">
            Bu bo‘limda hozircha mahsulotlar yo‘q
          </p>
        </div>
      )}

      <BottomNav />
    </main>
  );
}

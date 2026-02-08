// app/page.tsx
"use client";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { products } from "@/lib/data"; // ← Import from data.ts


type CategoryId = "non_kabob" | "tea" | "coffee" | "water";

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryId>("non_kabob");

  const tabs: { id: CategoryId; label: string }[] = [
    { id: "non_kabob", label: t.cat_non_kabob },
    { id: "tea", label: t.cat_tea },
    { id: "coffee", label: t.cat_coffee },
    { id: "water", label: t.cat_waters },
  ];

  const filteredProducts = products.filter((p) => p.category === activeTab);

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

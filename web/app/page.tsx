// app/page.tsx
"use client";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

// 1. Define Category Types
type CategoryId = 'non_kabob' | 'hot_dog' | 'cold_drinks' | 'hot_drinks' | 'sauces';

// 2. Define Products Data (grouped by category)
const PRODUCTS = [
  // --- NON KABOB ---
  { id: 1, name: "Tovuqli Non Kabob", price: 28000, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80", category: 'non_kabob' },
  { id: 2, name: "Mol Go'shtli Non Kabob", price: 32000, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80", category: 'non_kabob' },
  { id: 3, name: "Assorti Non Kabob", price: 35000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80", category: 'non_kabob' },

  // --- HOT DOG ---
  { id: 10, name: "Classic Hot Dog", price: 18000, image: "https://images.unsplash.com/photo-1612392062631-94dd85fa2dd8?auto=format&fit=crop&w=800&q=80", category: 'hot_dog' },
  { id: 11, name: "Cheese Hot Dog", price: 22000, image: "https://images.unsplash.com/photo-1595603774823-3b36449174df?auto=format&fit=crop&w=800&q=80", category: 'hot_dog' },
  { id: 12, name: "Royal Hot Dog", price: 25000, image: "https://images.unsplash.com/photo-1627054248554-1262d49938b8?auto=format&fit=crop&w=800&q=80", category: 'hot_dog' },

  // --- COLD DRINKS ---
  { id: 20, name: "Coca Cola 0.5L", price: 8000, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80", category: 'cold_drinks' },
  { id: 21, name: "Fanta 0.5L", price: 8000, image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80", category: 'cold_drinks' },
  { id: 22, name: "Moxito (Ice)", price: 15000, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", category: 'cold_drinks' },

  // --- HOT DRINKS ---
  { id: 30, name: "Qora Choy", price: 5000, image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80", category: 'hot_drinks' },
  { id: 31, name: "Ko'k Choy", price: 5000, image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=800&q=80", category: 'hot_drinks' },
  { id: 32, name: "Limon Choy", price: 8000, image: "https://images.unsplash.com/photo-1576092768241-dec231847233?auto=format&fit=crop&w=800&q=80", category: 'hot_drinks' },

  // --- SAUCES ---
  { id: 40, name: "Ketchup", price: 3000, image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=800&q=80", category: 'sauces' },
  { id: 41, name: "Mayonez", price: 3000, image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&q=80", category: 'sauces' },
  { id: 42, name: "Pishloqli Sous", price: 4000, image: "https://images.unsplash.com/photo-1620917670397-a3313280dd65?auto=format&fit=crop&w=800&q=80", category: 'sauces' },
];

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryId>('non_kabob');

  // Define Tabs using Global Translations
  const tabs: { id: CategoryId; label: string }[] = [
    { id: 'non_kabob', label: t.cat_non_kabob },
    { id: 'hot_dog', label: t.cat_hot_dog },
    { id: 'cold_drinks', label: t.cat_cold_drinks },
    { id: 'hot_drinks', label: t.cat_hot_drinks },
    { id: 'sauces', label: t.cat_sauces },
  ];

  // Filter Products
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
            {/* You can add a small logo here if you want */}
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

      {/* Navigation */}
      <BottomNav />
    </main>
  );
}
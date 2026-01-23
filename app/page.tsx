// src/app/page.tsx
import { products } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">NonKabob Guliston</h1>
        <p className="text-xs text-gray-500">Yetkazib berish • Guliston</p>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Navigation */}
      <BottomNav />
    </main>
  );
}
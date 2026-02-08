"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext"; // ✅ Added
import { Plus, Minus } from "lucide-react";

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart, removeFromCart, getItemCount } = useCart();
  const { t } = useLanguage(); // ✅ Hook into global translations
  const quantity = getItemCount(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-transform duration-200 active:scale-[0.98]">
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          priority={false}
        />
        {/* subtle gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0" />

        {/* Quantity badge */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full text-xs font-bold text-white bg-orange-500 shadow">
              {quantity}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-extrabold text-gray-900 leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-3">
          {product.price.toLocaleString()} UZS
        </p>

        {/* CTA */}
        {quantity === 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="mt-auto w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-transform"
          >
            {t.add_to_cart || "Qo'shish"} {/* ✅ Translated */}
          </button>
        ) : (
          <div className="mt-auto flex items-center justify-between bg-gray-100 rounded-xl p-1.5">
            <button
              onClick={() => removeFromCart(product.id)}
              className="h-9 w-9 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 text-gray-700 active:scale-95 transition-transform"
              aria-label="Decrease"
            >
              <Minus size={18} />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[11px] text-gray-400 leading-none">
                {t.item_count || "Soni"} {/* ✅ Translated */}
              </span>
              <span className="font-extrabold text-gray-900 text-base leading-tight">
                {quantity}
              </span>
            </div>

            <button
              onClick={() => addToCart(product)}
              className="h-9 w-9 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 text-orange-500 active:scale-95 transition-transform"
              aria-label="Increase"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
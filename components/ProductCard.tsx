// components/ProductCard.tsx
"use client"; // This component needs interactivity

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';

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
  const quantity = getItemCount(product.id);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-32 w-full">
        <Image 
          src={product.image} 
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-3">
            {product.price.toLocaleString()} UZS
        </p>

        {quantity === 0 ? (
          <button 
            onClick={() => addToCart(product)}
            className="mt-auto w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
          >
            Add
          </button>
        ) : (
          <div className="mt-auto flex items-center justify-between bg-gray-100 rounded-lg p-1">
             <button 
                onClick={() => removeFromCart(product.id)}
                className="p-1 bg-white rounded-md shadow-sm text-gray-600 active:scale-95"
             >
                <Minus size={16} />
             </button>
             <span className="font-bold text-gray-800 text-sm">{quantity}</span>
             <button 
                onClick={() => addToCart(product)}
                className="p-1 bg-white rounded-md shadow-sm text-orange-500 active:scale-95"
             >
                <Plus size={16} />
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
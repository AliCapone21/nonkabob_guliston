// components/BottomNav.tsx
"use client";

import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <--- 1. Import this to check current page

export default function BottomNav() {
  const { items } = useCart();
  const pathname = usePathname(); // <--- 2. Get current URL path
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Helper function to decide color: Orange if active, Gray if not
  const isActive = (path: string) => pathname === path ? "text-orange-500" : "text-gray-400";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50">
      
      {/* MENU */}
      <Link href="/" className={`flex flex-col items-center ${isActive('/')}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium mt-1">Menu</span>
      </Link>
      
      {/* CART */}
      <Link href="/cart" className={`flex flex-col items-center relative ${isActive('/cart')}`}>
        <ShoppingCart size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {itemCount}
          </span>
        )}
        <span className="text-[10px] font-medium mt-1">Savat</span>
      </Link>

      {/* ORDERS */}
      <Link href="/orders" className={`flex flex-col items-center ${isActive('/orders')}`}>
        <ClipboardList size={24} />
        <span className="text-[10px] font-medium mt-1">Buyurtma</span>
      </Link>

      {/* PROFILE - FIXED: Changed div to Link */}
      <Link href="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
        <User size={24} />
        <span className="text-[10px] font-medium mt-1">Profil</span>
      </Link>
      
    </div>
  );
}
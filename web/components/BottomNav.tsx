// components/BottomNav.tsx
"use client";

import { Home, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const { items } = useCart();
  const pathname = usePathname();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Active if exact or sub-route (e.g. /orders/123)
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const baseItem =
    "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors";
  const active = "text-orange-500";
  const inactive = "text-gray-400";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center px-6 py-2">
        {/* MENU */}
        <Link
          href="/"
          className={`${baseItem} ${isActive("/") ? active : inactive}`}
        >
          <Home size={22} strokeWidth={isActive("/") ? 2.5 : 2} />
          <span>Menu</span>
        </Link>

        {/* CART */}
        <Link
          href="/cart"
          className={`${baseItem} relative ${isActive("/cart") ? active : inactive}`}
        >
          <ShoppingCart size={22} strokeWidth={isActive("/cart") ? 2.5 : 2} />

          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {itemCount}
            </span>
          )}

          <span>Savat</span>
        </Link>

        {/* ORDERS */}
        <Link
          href="/orders"
          className={`${baseItem} ${isActive("/orders") ? active : inactive}`}
        >
          <ClipboardList size={22} strokeWidth={isActive("/orders") ? 2.5 : 2} />
          <span>Buyurtma</span>
        </Link>

        {/* PROFILE */}
        <Link
          href="/profile"
          className={`${baseItem} ${isActive("/profile") ? active : inactive}`}
        >
          <User size={22} strokeWidth={isActive("/profile") ? 2.5 : 2} />
          <span>Profil</span>
        </Link>
      </div>
    </nav>
  );
}

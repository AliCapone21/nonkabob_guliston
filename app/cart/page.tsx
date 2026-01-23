// app/cart/page.tsx
"use client";

import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // <--- Connecting to DB
import { useState } from "react";

export default function CartPage() {
  const { items, addToCart, removeFromCart, totalPrice } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

 // ... inside CartPage component

  const handleCheckout = async () => {
    if (isSubmitting) return;

    // 1. CHECK USER PROFILE FIRST
    let telegramUserId = 123456; // Default fake ID for localhost
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
        telegramUserId = (window as any).Telegram.WebApp.initDataUnsafe.user.id;
    }

    // Check Supabase for this user
    const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUserId)
        .single();

    // IF NO PHONE NUMBER, REDIRECT TO PROFILE
    if (!userProfile || !userProfile.phone_number || userProfile.phone_number.length < 9) {
        alert("Iltimos, avval telefon raqamingizni kiriting!");
        router.push('/profile'); // <--- Redirects them!
        return;
    }

    setIsSubmitting(true);

    try {
      // 2. Create the Order (Now with REAL user data!)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_price: totalPrice,
          status: 'pending',
          customer_name: userProfile.full_name, // Real Name
          customer_phone: userProfile.phone_number, // Real Phone
          telegram_user_id: telegramUserId
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Save Items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert("Buyurtmangiz qabul qilindi!");
      items.forEach(item => removeFromCart(item.id));
      router.push('/orders');

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- EMPTY STATE ---
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 flex flex-col">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Savatcha</h1>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-orange-100 p-6 rounded-full mb-4">
            <ShoppingBagIcon size={48} className="text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Savat hozircha bo'sh
          </h2>
          <Link
            href="/"
            className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            Menyuga qaytish
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  // --- CART LIST STATE ---
  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center">
            <Link href="/" className="mr-4">
                <ArrowLeft size={24} className="text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Savatcha</h1>
        </div>
        <button 
            onClick={() => {
                if(confirm("Savatni tozalamoqchimisiz?")) {
                    items.forEach(i => removeFromCart(i.id)); 
                }
            }}
            className="text-red-500 text-sm font-medium flex items-center"
        >
            <Trash2 size={16} className="mr-1" /> Tozalash
        </button>
      </div>

      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            
            <div className="ml-4 flex-grow">
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.price.toLocaleString()} UZS</p>
            </div>

            <div className="flex flex-col items-end space-y-2">
               <div className="flex items-center bg-gray-100 rounded-lg p-1">
                 <button onClick={() => removeFromCart(item.id)} className="p-1 bg-white rounded-md shadow-sm text-gray-600">
                    <Minus size={16} />
                 </button>
                 <span className="mx-3 font-bold text-sm w-4 text-center">{item.quantity}</span>
                 <button onClick={() => addToCart(item)} className="p-1 bg-white rounded-md shadow-sm text-green-500">
                    <Plus size={16} />
                 </button>
               </div>
               <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-[70px] left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500">Jami summa:</span>
            <span className="text-xl font-bold text-gray-900">{totalPrice.toLocaleString()} UZS</span>
        </div>
        <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:bg-gray-400 flex justify-center items-center"
        >
            {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" /> Yuklanmoqda...
                </>
            ) : (
                "Buyurtma berish"
            )}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function ShoppingBagIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
    )
}
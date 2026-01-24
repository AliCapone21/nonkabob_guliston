// app/orders/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Clock, CheckCircle2, ChefHat, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Order = {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  order_items: {
    product_name: string;
    quantity: number;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      let telegramUserId: number | null = null;

      if (typeof window !== "undefined") {
        // Telegram user (real)
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id as number;
        }
        // Localhost test user
        else if (window.location.hostname === "localhost") {
          telegramUserId = 123456;
        }
      }

      // If no ID -> treat as guest with no orders
      if (!telegramUserId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch ONLY this user's orders (using BIGINT FK)
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (product_name, quantity)
        `
        )
        .eq("user_id", telegramUserId) // ✅ FIX: use BIGINT FK (orders.user_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } else {
        setOrders((data as Order[]) || []);
      }

      setLoading(false);
    };

    fetchUserOrders();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Buyurtmalar tarixi</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="animate-spin text-orange-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">Hozircha buyurtmalar yo&apos;q</p>
            <Link href="/" className="text-orange-500 font-semibold">
              Menyuga o&apos;tish
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-400">Buyurtma #{order.id}</span>
                  <p className="font-bold text-gray-800">
                    {Number(order.total_price).toLocaleString()} UZS
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="border-t border-dashed border-gray-200 my-3"></div>

              <div className="space-y-1">
                {(order.order_items ?? []).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product_name}{" "}
                      <span className="text-xs text-gray-400">x{item.quantity}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: Clock,
      label: "Kutilmoqda",
    },
    cooking: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: ChefHat,
      label: "Tayyorlanmoqda",
    },
    delivered: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle2,
      label: "Yetkazildi",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: XCircle,
      label: "Bekor qilindi",
    },
  };

  const config = styles[status as keyof typeof styles] || styles.pending;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center`}
    >
      <Icon size={14} className="mr-1" />
      {config.label}
    </div>
  );
}

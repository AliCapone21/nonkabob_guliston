// app/orders/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Clock, CheckCircle2, ChefHat, XCircle, ArrowRight } from "lucide-react";
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
    fetchOrders();
    
    // Subscribe to real-time updates (so status changes instantly)
    const channel = supabase
      .channel('orders_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(); // Refresh if something changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    // Fetch orders AND their items
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (product_name, quantity)
      `)
      .order('created_at', { ascending: false }); // Newest first

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Buyurtmalar tarixi</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 mt-10">Yuklanmoqda...</p>
        ) : orders.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-4">Hozircha buyurtmalar yo'q</p>
            <Link href="/" className="text-orange-500 font-semibold">
              Menyuga o'tish
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-400">Buyurtma #{order.id}</span>
                  <p className="font-bold text-gray-800">
                    {order.total_price.toLocaleString()} UZS
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString('uz-UZ')}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="border-t border-dashed border-gray-200 my-3"></div>

              <div className="space-y-1">
                {order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product_name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
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
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Kutilmoqda" },
    cooking: { bg: "bg-blue-100", text: "text-blue-700", icon: ChefHat, label: "Tayyorlanmoqda" },
    delivered: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2, label: "Yetkazildi" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Bekor qilindi" },
  };

  // Default to pending if status is unknown
  const config = styles[status as keyof typeof styles] || styles.pending;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium flex items-center`}>
      <Icon size={14} className="mr-1" />
      {config.label}
    </div>
  );
}
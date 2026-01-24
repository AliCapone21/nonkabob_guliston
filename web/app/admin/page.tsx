// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCw, MapPin, Phone, X } from "lucide-react";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Order = {
  id: number;
  created_at: string;
  status: "pending" | "cooking" | "delivered" | "cancelled" | string;
  total_price: number;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_location: string | null;
  order_items: OrderItem[] | null;
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState("");

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-4">Admin Kirish</h1>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border p-3 rounded-lg mb-4 text-center text-lg"
            placeholder="PIN kodni kiriting"
          />
          <button
            onClick={() => {
              if (pin === "1234") setAuthorized(true);
              else alert("Noto'g'ri kod!");
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
          >
            Kirish
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    setRefreshing(true);

    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (product_name, quantity)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } else {
      setOrders((data as Order[]) || []);
    }

    setRefreshing(false);
  }

  // ✅ OPTIMISTIC UI: update UI instantly, then update DB
  async function updateStatus(orderId: number, newStatus: Order["status"]) {
    // 1) remember old status in case we need rollback
    const prev = orders.find((o) => o.id === orderId)?.status;

    // 2) update UI instantly
    setOrders((curr) =>
      curr.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // 3) write to DB
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

    if (error) {
      console.error("Error updating status:", error);

      // 4) rollback UI if DB failed
      if (prev) {
        setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: prev } : o)));
      }

      alert("Status o'zgartirishda xatolik. Qayta urinib ko'ring.");
      return;
    }

    // Optional: re-fetch to be 100% synced (not required but safe)
    // fetchOrders();
  }

  const pillClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cooking":
        return "bg-blue-100 text-blue-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const accentBar = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400";
      case "cooking":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Buyurtmalar</h1>

        <button
          onClick={fetchOrders}
          className="p-2 bg-white rounded-full shadow-sm disabled:opacity-60"
          aria-label="Refresh"
          disabled={refreshing}
        >
          <RefreshCw size={20} className={`text-gray-600 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const phone = order.customer_phone?.trim() || "";
          const location = order.delivery_location?.trim() || "";
          const items = order.order_items ?? [];

          const showPendingActions = order.status === "pending";
          const showCookingActions = order.status === "cooking";

          return (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`h-1 -mx-4 -mt-4 mb-4 ${accentBar(order.status)}`} />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    #{order.id} - {order.customer_name || "Mijoz"}
                  </h3>

                  <div className="mt-2 space-y-1">
                    {phone ? (
                      <a href={`tel:${phone}`} className="inline-flex items-center text-blue-600 font-medium text-sm hover:underline">
                        <Phone size={14} className="mr-1" />
                        {phone}
                      </a>
                    ) : (
                      <div className="inline-flex items-center text-gray-500 text-sm">
                        <Phone size={14} className="mr-1" />
                        Raqam yo&apos;q
                      </div>
                    )}

                    {location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          location.replace("GPS: ", "")
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-gray-600 text-sm hover:underline"
                      >
                        <MapPin size={14} className="mr-1" />
                        {location}
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${pillClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 mb-1 last:mb-0">
                      <span className="pr-2">{item.product_name}</span>
                      <span className="font-bold">x{item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Mahsulotlar yuklanmoqda...</p>
                )}

                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Jami:</span>
                  <span>{Number(order.total_price).toLocaleString()} UZS</span>
                </div>
              </div>

              {(showPendingActions || showCookingActions) && (
                <div className="grid grid-cols-3 gap-2">
                  {showPendingActions && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "cooking")}
                        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition active:scale-[0.99]"
                      >
                        Pishirishni boshlash
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Buyurtmani bekor qilmoqchimisiz?")) {
                            updateStatus(order.id, "cancelled");
                          }
                        }}
                        className="col-span-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1 active:scale-[0.99]"
                      >
                        <X size={16} />
                        Bekor
                      </button>
                    </>
                  )}

                  {showCookingActions && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "delivered")}
                        className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition active:scale-[0.99]"
                      >
                        Yetkazildi (Done)
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Buyurtmani bekor qilmoqchimisiz?")) {
                            updateStatus(order.id, "cancelled");
                          }
                        }}
                        className="col-span-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-1 active:scale-[0.99]"
                      >
                        <X size={16} />
                        Bekor
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

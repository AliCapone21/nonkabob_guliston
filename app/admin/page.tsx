// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCw, MapPin, Phone } from "lucide-react";

type Order = {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_location: string | null;
  order_items: {
    product_name: string;
    quantity: number;
  }[] | null;
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState("");

  // --- LOGIN SCREEN ---
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
              if (pin === "1234") setAuthorized(true); // <--- CHANGE PIN HERE
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

  // --- DASHBOARD SCREEN ---
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();

    // Realtime: refresh on orders OR order_items changes (prevents "empty items" issue)
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

  async function updateStatus(orderId: number, newStatus: string) {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) console.error("Error updating status:", error);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Buyurtmalar</h1>
        <button
          onClick={fetchOrders}
          className="p-2 bg-white rounded-full shadow-sm"
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

          return (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-l-blue-500"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    #{order.id} - {order.customer_name || "Mijoz"}
                  </h3>

                  {/* Customer Details */}
                  <div className="mt-2 space-y-1">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        className="flex items-center text-blue-600 font-medium text-sm"
                      >
                        <Phone size={14} className="mr-1" />
                        {phone}
                      </a>
                    ) : (
                      <div className="flex items-center text-gray-500 text-sm">
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
                        className="flex items-center text-gray-600 text-sm hover:underline"
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

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize
                    ${order.status === "pending" ? "bg-yellow-100 text-yellow-700" : ""}
                    ${order.status === "cooking" ? "bg-blue-100 text-blue-700" : ""}
                    ${order.status === "delivered" ? "bg-green-100 text-green-700" : ""}
                    ${order.status === "cancelled" ? "bg-red-100 text-red-700" : ""}
                  `}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-gray-700 mb-1 last:mb-0"
                  >
                    <span>{item.product_name}</span>
                    <span className="font-bold">x{item.quantity}</span>
                  </div>
                ))}

                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Jami:</span>
                  <span>{Number(order.total_price).toLocaleString()} UZS</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "cooking")}
                    className="col-span-3 bg-blue-500 text-white py-2 rounded-lg font-medium"
                  >
                    Pishirishni boshlash (Cooking)
                  </button>
                )}

                {order.status === "cooking" && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, "delivered")}
                      className="col-span-2 bg-green-500 text-white py-2 rounded-lg font-medium"
                    >
                      Yetkazildi (Done)
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, "cancelled")}
                      className="bg-red-100 text-red-500 py-2 rounded-lg font-medium"
                    >
                      Bekor
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

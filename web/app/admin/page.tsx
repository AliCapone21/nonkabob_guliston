// app/admin/page.tsx - FULL CODE WITH COPY BUTTONS
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  RefreshCw, MapPin, Phone, X, Copy, 
  LayoutList, BarChart3, TrendingUp, Calendar, DollarSign,
  CheckCircle2, Clock, Ban, Bell, Trash2
} from "lucide-react";

// --- TYPES ---
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

// --- COPY TO CLIPBOARD HOOK ---
const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return { copy, copied };
};

// --- MAIN PAGE COMPONENT ---
export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/ding.mp3");
    audio.load();
    setAudioObj(audio);
  }, []);

  const handleLogin = () => {
    if (pin === "1234") {
      if (audioObj) {
        audioObj.play().then(() => {
          audioObj.pause();
          audioObj.currentTime = 0;
        }).catch(e => console.log("Audio permission error:", e));
      }
      setAuthorized(true);
    } else {
      alert("Noto'g'ri kod!");
    }
  };

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
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold active:scale-95 transition-transform"
          >
            Kirish
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard audio={audioObj} />;
}

// --- DASHBOARD COMPONENT ---
function AdminDashboard({ audio }: { audio: HTMLAudioElement | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'stats'>('orders');
  const [orderFilter, setOrderFilter] = useState<'active' | 'completed' | 'cancelled'>('active');

  // 🚀 GPS LOCATION HANDLER
  const handleLocationLink = (location: string): string => {
    const cleanLocation = location.replace("GPS: ", "").trim();
    const gpsMatch = cleanLocation.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    if (gpsMatch) {
      const [lat, lng] = gpsMatch;
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanLocation)}`;
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("admin_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === 'INSERT') {
          playSound();
        }
        fetchOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const playSound = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Sound play failed", e));
    }
  };

  async function fetchOrders() {
    setRefreshing(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (product_name, quantity)`)
      .order("created_at", { ascending: false });

    if (!error) setOrders((data as Order[]) || []);
    setRefreshing(false);
  }

  async function updateStatus(orderId: number, newStatus: Order["status"]) {
    const prev = orders.find((o) => o.id === orderId)?.status;
    setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

    if (error) {
      if (prev) setOrders((curr) => curr.map((o) => (o.id === orderId ? { ...o, status: prev } : o)));
      alert("Xatolik yuz berdi.");
    }
  }

  async function clearDatabase() {
    const confirm1 = confirm("DIQQAT! Barcha buyurtmalarni o'chirib tashlamoqchimisiz? (Haftalik tozalash)");
    if (!confirm1) return;

    const confirm2 = confirm("Bu amalni ortga qaytarib bo'lmaydi. IDlar #1 dan boshlanadi. Tasdiqlaysizmi?");
    if (!confirm2) return;

    setRefreshing(true);
    const { error } = await supabase.rpc('clear_orders');

    if (error) {
      alert("Xatolik: " + error.message);
    } else {
      alert("Baza tozalandi! Barcha buyurtmalar o'chirildi.");
      fetchOrders();
    }
    setRefreshing(false);
  }

  // --- COUNTERS & FILTERS ---
  const activeCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

  const getFilteredOrders = () => {
    return orders.filter(o => {
      if (orderFilter === 'active') return o.status === 'pending' || o.status === 'cooking';
      if (orderFilter === 'completed') return o.status === 'delivered';
      if (orderFilter === 'cancelled') return o.status === 'cancelled';
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  // --- STATS ---
  const calculateStats = () => {
    const now = new Date();
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    const todayOrders = deliveredOrders.filter(o => {
      const d = new Date(o.created_at);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const dailyIncome = todayOrders.reduce((sum, o) => sum + o.total_price, 0);

    const monthOrders = deliveredOrders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyIncome = monthOrders.reduce((sum, o) => sum + o.total_price, 0);

    const totalIncome = deliveredOrders.reduce((sum, o) => sum + o.total_price, 0);

    const productCounts: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== 'cancelled') {
        order.order_items?.forEach(item => {
          productCounts[item.product_name] = (productCounts[item.product_name] || 0) + item.quantity;
        });
      }
    });

    const topProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { dailyIncome, monthlyIncome, totalIncome, topProducts, todayCount: todayOrders.length };
  };

  const stats = calculateStats();

  return (
    <main className="min-h-screen bg-gray-100 p-4 pb-20">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-2 mb-4 flex justify-between items-center sticky top-2 z-20">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <LayoutList size={18} /> Buyurtmalar
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'stats' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            <BarChart3 size={18} /> Hisobot
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={clearDatabase} className="p-2 bg-red-50 text-red-600 rounded-full active:scale-90 border border-red-100" title="Bazani tozalash">
            <Trash2 size={20} />
          </button>
          <button onClick={playSound} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90" title="Ovozni tekshirish">
            <Bell size={20} />
          </button>
          <button onClick={fetchOrders} disabled={refreshing} className="p-2 bg-gray-100 rounded-full text-gray-600 active:scale-90" title="Yangilash">
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* SUB TABS */}
      {activeTab === 'orders' && (
        <div className="flex gap-2 overflow-x-auto pb-4 sticky top-[72px] z-10 bg-gray-100 pt-1 scrollbar-hide">
          <button 
            onClick={() => setOrderFilter('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm border ${
              orderFilter === 'active' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock size={16} /> Faol <span className="bg-white/20 px-1.5 rounded text-xs ml-1">{activeCount}</span>
          </button>
          <button 
            onClick={() => setOrderFilter('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm border ${
              orderFilter === 'completed' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 size={16} /> Yetkazildi <span className={`px-1.5 rounded text-xs ml-1 ${orderFilter === 'completed' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{completedCount}</span>
          </button>
          <button 
            onClick={() => setOrderFilter('cancelled')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm border ${
              orderFilter === 'cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Ban size={16} /> Bekor <span className={`px-1.5 rounded text-xs ml-1 ${orderFilter === 'cancelled' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>{cancelledCount}</span>
          </button>
        </div>
      )}

      {/* ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 && (
            <div className="text-center py-20 text-gray-400 flex flex-col items-center">
              <LayoutList size={40} className="mb-2 opacity-20" />
              <p>Bu bo'limda buyurtmalar yo'q</p>
            </div>
          )}

          {filteredOrders.map((order) => {
            const phone = order.customer_phone?.trim() || "";
            const location = order.delivery_location?.trim() || "";
            const items = order.order_items ?? [];
            const showPending = order.status === "pending";
            const showCooking = order.status === "cooking";

            const { copy: copyPhone, copied: copiedPhone } = useCopyToClipboard();
            const { copy: copyLocation, copied: copiedLocation } = useCopyToClipboard();

            return (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  order.status === 'pending' ? 'bg-yellow-400' : 
                  order.status === 'cooking' ? 'bg-blue-500' :
                  order.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                
                <div className="pl-3">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        #{order.id} - {order.customer_name || "Mijoz"}
                      </h3>
                      
                      {/* 📱 PHONE WITH COPY */}
                      {phone && (
                        <div className="mt-2 flex items-center gap-2">
                          <a href={`tel:${phone}`} className="inline-flex items-center text-blue-600 font-medium text-sm hover:underline flex-1">
                            <Phone size={14} className="mr-1" /> {phone}
                          </a>
                          <button
                            onClick={() => copyPhone(phone)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                            title="Telefonni nusxalash"
                          >
                            <Copy size={16} className={copiedPhone ? 'text-green-500' : ''} />
                          </button>
                        </div>
                      )}

                      {/* 📍 LOCATION WITH COPY */}
                      {location && (
                        <div className="mt-2 flex items-center gap-2">
                          <a
                            href={handleLocationLink(location)}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center text-gray-600 text-sm hover:underline flex-1"
                          >
                            <MapPin size={14} className="mr-1 flex-shrink-0" /> 
                            <span className="truncate">{location}</span>
                          </a>
                          <button
                            onClick={() => copyLocation(location)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                            title="Manzilni nusxalash"
                          >
                            <Copy size={16} className={copiedLocation ? 'text-green-500' : ''} />
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(order.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'cooking' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700 mb-1">
                        <span>{item.product_name}</span>
                        <span className="font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-base text-gray-900">
                      <span>Jami:</span>
                      <span>{Number(order.total_price).toLocaleString()} UZS</span>
                    </div>
                  </div>

                  {(showPending || showCooking) && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateStatus(order.id, showPending ? "cooking" : "delivered")}
                        className={`col-span-2 text-white py-3 rounded-xl font-bold transition active:scale-[0.98] ${showPending ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {showPending ? "Pishirishni boshlash" : "Yetkazildi (Yopish)"}
                      </button>
                      <button
                        onClick={() => { if (confirm("Bekor qilinsinmi?")) updateStatus(order.id, "cancelled"); }}
                        className="col-span-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold transition active:scale-[0.98] border border-red-100"
                      >
                        <X size={20} className="mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
              <p className="text-gray-500 text-xs font-bold uppercase flex items-center gap-1">
                <Calendar size={12} /> Bugun
              </p>
              <h2 className="text-xl font-bold text-gray-800 mt-1">
                {stats.dailyIncome.toLocaleString()} <span className="text-xs text-gray-400">UZS</span>
              </h2>
              <p className="text-xs text-green-600 mt-1">{stats.todayCount} ta buyurtma</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <p className="text-gray-500 text-xs font-bold uppercase flex items-center gap-1">
                <Calendar size={12} /> Shu oy
              </p>
              <h2 className="text-xl font-bold text-gray-800 mt-1">
                {stats.monthlyIncome.toLocaleString()} <span className="text-xs text-gray-400">UZS</span>
              </h2>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-5 rounded-xl shadow-md text-white">
            <p className="text-gray-300 text-xs font-bold uppercase flex items-center gap-2">
              <DollarSign size={14} /> Jami Savdo
            </p>
            <h2 className="text-3xl font-bold mt-2">{stats.totalIncome.toLocaleString()} UZS</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500"/> Eng ko'p sotilganlar
            </h3>
            <div className="space-y-3">
              {stats.topProducts.length > 0 ? (
                stats.topProducts.map(([name, count], index) => (
                  <div key={name} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                        #{index + 1}
                      </span>
                      <span className="text-gray-700 font-medium">{name}</span>
                    </div>
                    <span className="font-bold text-gray-900 bg-orange-50 px-2 py-1 rounded-md text-sm">
                      {count} ta
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Ma'lumot yo'q</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

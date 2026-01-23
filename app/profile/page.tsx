// app/profile/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, Phone, Loader2, User as UserIcon, 
  ChevronRight, Building2, FileText, Globe, 
  ArrowLeft, LogIn, PhoneCall, AlertTriangle 
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'guest' | 'form'>('guest');
  const [isTelegram, setIsTelegram] = useState(false); // Track if we are really in Telegram

  useEffect(() => {
    const initProfile = async () => {
      let telegramUser = null;
      let inTelegram = false;

      if (typeof window !== 'undefined') {
        // 1. Check if we are on Localhost (Computer)
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1");

        try {
          const WebApp = (await import('@twa-dev/sdk')).default;
          WebApp.ready();
          
          if (WebApp.initDataUnsafe.user) {
            telegramUser = WebApp.initDataUnsafe.user;
            inTelegram = true;
          }
        } catch (e) {
          console.log("Not in Telegram");
        }

        // 2. Only use Fake User if we are on Localhost AND no real user found
        if (!telegramUser && isLocalhost) {
          console.log("Using Test User (Localhost only)");
          telegramUser = { id: 123456, first_name: "Test User (Localhost)" };
          inTelegram = true; // Pretend we are in Telegram for testing
        }
      }

      setIsTelegram(inTelegram);

      if (telegramUser) {
        setUser(telegramUser);
        checkUserExists(telegramUser.id);
      }
    };

    initProfile();
  }, []);

  async function checkUserExists(telegramId: number) {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
    if (data && data.phone_number) {
      setPhone(data.phone_number);
      setAddress(data.address_text || "");
      setView('form'); 
    }
  }

  // ... (handleGetLocation and handleSave are same as before)
  function handleGetLocation() {
    if ("geolocation" in navigator) {
      setAddress("Lokatsiya aniqlanmoqda...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setAddress(`GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        }, 
        (error) => {
          console.error(error);
          setAddress(""); 
        }
      );
    } else {
      alert("Brauzeringiz lokatsiyani qo'llab quvvatlamaydi.");
    }
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    const updates = {
      telegram_id: user.id,
      full_name: user.first_name + (user.last_name ? " " + user.last_name : ""),
      phone_number: phone,
      address_text: address,
      latitude: location?.lat,
      longitude: location?.lng,
    };
    const { error } = await supabase.from('users').upsert(updates);
    setLoading(false);
    if (error) alert("Xatolik!");
    else alert("Muvaffaqiyatli saqlandi!");
  }

  // --- SAFETY CHECK: IF NOT IN TELEGRAM ---
  if (!isTelegram) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-orange-100 p-4 rounded-full mb-4">
            <AlertTriangle className="text-orange-500" size={40} />
        </div>
        <h1 className="font-bold text-xl mb-2">Iltimos, Telegramdan kiring</h1>
        <p className="text-gray-500 text-sm">
            Ushbu ilova faqat Telegram ichida ishlaydi.
        </p>
      </main>
    );
  }

  // --- VIEW 1: GUEST MENU ---
  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 p-4">
        {/* ... SAME GUEST CODE AS BEFORE ... */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="text-orange-500" size={32} />
            </div>
            <h2 className="font-bold text-lg mb-2">Profilga kirish</h2>
            <p className="text-gray-500 text-sm mb-6 px-4">
                Bu mahsulotlarga buyurtma berish va ularni kuzatish uchun kerak.
            </p>
            <button 
                onClick={() => setView('form')}
                className="w-full bg-green-500 text-white py-3 rounded-xl font-bold mb-3 active:scale-95 transition-transform"
            >
                Kirish (Login)
            </button>
            <button className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <PhoneCall size={20} />
                Biz bilan bog'laning
            </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <MenuItem icon={Building2} label="Filiallarimiz" />
            <MenuItem icon={FileText} label="Kompaniya haqida" />
            <MenuItem icon={Globe} label="Ilova tili" isLast />
        </div>
        <BottomNav />
      </main>
    );
  }

  // --- VIEW 2: FORM ---
  return (
    <main className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Ma'lumotlarni kiritish</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="text-center mb-4">
             <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <UserIcon size={40} className="text-gray-400" />
            </div>
            {/* Show Real User Info */}
            <h2 className="font-bold text-gray-800">{user?.first_name}</h2>
            <p className="text-gray-500 text-sm">ID: {user?.id}</p>
        </div>
        
        <div>
            <label className="block text-sm text-gray-500 mb-1">Telefon raqam</label>
            <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50 focus-within:ring-2 ring-orange-200 transition-all">
                <Phone size={18} className="text-gray-400 mr-2" />
                <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent w-full outline-none text-lg font-medium"
                    placeholder="+998"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm text-gray-500 mb-1">Manzil</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border rounded-lg px-3 py-3 bg-gray-50 w-full outline-none text-sm"
                    placeholder="Manzilni aniqlash..."
                />
                <button 
                    onClick={handleGetLocation}
                    className="bg-blue-100 text-blue-600 p-3 rounded-lg active:scale-95 transition-colors hover:bg-blue-200"
                >
                    <MapPin size={24} />
                </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Lokatsiya avtomatik aniqlanadi</p>
        </div>

        <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 flex justify-center items-center text-lg mt-4"
        >
            {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function MenuItem({ icon: Icon, label, isLast }: { icon: any, label: string, isLast?: boolean }) {
    return (
        <div className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-gray-100' : ''} active:bg-gray-50`}>
            <div className="flex items-center gap-3 text-gray-600">
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
        </div>
    )
}
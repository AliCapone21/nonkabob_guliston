// app/profile/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, Phone, Save, Loader2, User as UserIcon, 
  ChevronRight, Building2, FileText, ShieldCheck, Globe, 
  ArrowLeft, LogIn, PhoneCall 
} from "lucide-react";
import WebApp from "@twa-dev/sdk";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // New State: Controls if we show the "Guest Menu" or the "Login Form"
  const [view, setView] = useState<'guest' | 'form'>('guest');

  useEffect(() => {
    // 1. Get Telegram User
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
      setUser(WebApp.initDataUnsafe.user);
      checkUserExists(WebApp.initDataUnsafe.user.id);
    } else {
      // Fake user for testing on PC
      const fakeUser = { id: 123456, first_name: "Test User" };
      setUser(fakeUser);
      checkUserExists(fakeUser.id);
    }
  }, []);

  async function checkUserExists(telegramId: number) {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
    if (data && data.phone_number) {
      // If user already has a phone number saved, go straight to the form (or show a "Logged In" dashboard)
      setPhone(data.phone_number);
      setAddress(data.address_text || "");
      setView('form'); 
    }
  }

  function handleGetLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setAddress(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        alert("Lokatsiya aniqlandi!");
      }, (error) => {
        alert("Lokatsiyani olishda xatolik. Iltimos ruxsat bering.");
      });
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

    if (error) {
      alert("Xatolik yuz berdi!");
      console.error(error);
    } else {
      alert("Ma'lumotlar saqlandi!");
      // Optionally redirect to menu
    }
  }

  // --- VIEW 1: GUEST MENU (Matches your screenshot) ---
  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 p-4">
        {/* Login Card */}
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

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <MenuItem icon={Building2} label="Filiallarimiz" />
            <MenuItem icon={FileText} label="Kompaniya haqida" />
            <MenuItem icon={ShieldCheck} label="Foydalanish shartlari" />
            <MenuItem icon={ShieldCheck} label="Maxfiylik siyosati" />
            <MenuItem icon={Globe} label="Ilova tili" isLast />
        </div>

        <div className="text-center mt-8 text-gray-400 text-xs">
            Bizni ijtimoiy tarmoqlarda kuzatib boring
        </div>

        <BottomNav />
      </main>
    );
  }

  // --- VIEW 2: EDIT FORM (My previous code) ---
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
            <h2 className="font-bold text-gray-800">{user?.first_name}</h2>
            <p className="text-gray-500 text-sm">ID: {user?.id}</p>
        </div>
        
        {/* Phone Input */}
        <div>
            <label className="block text-sm text-gray-500 mb-1">Telefon raqam</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <Phone size={18} className="text-gray-400 mr-2" />
                <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent w-full outline-none"
                    placeholder="+998 90 123 45 67"
                />
            </div>
        </div>

        {/* Location Input */}
        <div>
            <label className="block text-sm text-gray-500 mb-1">Manzil</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border rounded-lg px-3 py-2 bg-gray-50 w-full outline-none text-sm"
                    placeholder="Manzilni kiriting..."
                />
                <button 
                    onClick={handleGetLocation}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg active:scale-95"
                >
                    <MapPin size={20} />
                </button>
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-md active:scale-95 flex justify-center items-center"
        >
            {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

// Helper component for the list items
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
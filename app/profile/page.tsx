// app/profile/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, Phone, Loader2, User as UserIcon, 
  ArrowLeft, Send, LogIn // <--- ADDED LogIn HERE
} from "lucide-react";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(""); 
  const [phone, setPhone] = useState("+998");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'guest' | 'form'>('guest');
  const [needsPhone, setNeedsPhone] = useState(false);

  useEffect(() => {
    const checkTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        const telegramUser = tg.initDataUnsafe?.user;

        if (telegramUser) {
          setUser(telegramUser);
          if (!name) setName(telegramUser.first_name + (telegramUser.last_name ? " " + telegramUser.last_name : ""));
          checkUserExists(telegramUser.id);
        } else {
            if (window.location.hostname === "localhost") {
                const fakeUser = { id: 123456, first_name: "Test User" };
                setUser(fakeUser);
                setName("Test User");
                checkUserExists(fakeUser.id);
            }
        }
      }
    };

    setTimeout(checkTelegram, 500);
  }, []);

  async function checkUserExists(telegramId: number) {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();

    if (data) {
      if (data.phone_number && data.phone_number.length > 5) {
        setName(data.full_name || name);
        setPhone(data.phone_number);
        setAddress(data.address_text || "");
        setView('form');
        setNeedsPhone(false);
      } else {
        setView('form');
        setNeedsPhone(true);
        setTimeout(requestContact, 500); 
      }
    } else {
      setView('form');
      setNeedsPhone(true);
      setTimeout(requestContact, 500);
    }
  }

  const requestContact = () => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.requestContact((success: boolean, event: any) => {
            if (success) {
                const sharedPhone = event?.response?.contact?.phone_number;
                if (sharedPhone) {
                    const formatted = sharedPhone.startsWith('+') ? sharedPhone : `+${sharedPhone}`;
                    setPhone(formatted);
                    setNeedsPhone(false);
                    setTimeout(handleGetLocation, 500);
                }
            }
        });
    }
  };

  function handleGetLocation() {
    if ("geolocation" in navigator) {
      setAddress("Lokatsiya aniqlanmoqda...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setAddress(`GPS: ${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        }, 
        () => setAddress("")
      );
    }
  }

  async function handleSave() {
    if (!user) return;
    if (phone.length < 9) { alert("Telefon raqam noto'g'ri!"); return; }
    
    setLoading(true);

    const updates = {
      telegram_id: user.id,
      full_name: name,
      phone_number: phone,
      address_text: address,
      latitude: location?.lat,
      longitude: location?.lng,
    };

    const { error } = await supabase.from('users').upsert(updates);
    setLoading(false);

    if (error) alert("Xatolik: " + error.message);
    else {
      alert("Muvaffaqiyatli saqlandi!");
      setNeedsPhone(false);
    }
  }

  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <LogIn className="text-orange-500" size={32} />
            </div>
            <h2 className="font-bold text-lg mb-2">Profilga kirish</h2>
            <button onClick={() => setView('form')} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold active:scale-95">Kirish</button>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Ma'lumotlarni kiritish</h1>
      </div>

      {needsPhone && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4 text-center">
          <p className="text-sm text-green-800 mb-3 font-medium">Telefon raqamingiz kerak.</p>
          <button onClick={requestContact} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95">
            <Send size={18} /> Raqamni ulashish
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        
        {/* NAME INPUT */}
        <div>
            <label className="block text-sm text-gray-500 mb-1">Ismingiz</label>
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-3 bg-gray-50 outline-none text-lg font-medium"
                placeholder="Ismingiz"
            />
        </div>

        {/* PHONE INPUT */}
        <div>
            <label className="block text-sm text-gray-500 mb-1">Telefon raqam</label>
            <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50">
                <Phone size={18} className="text-gray-400 mr-2" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-transparent w-full outline-none text-lg font-medium" />
            </div>
        </div>

        {/* LOCATION INPUT */}
        <div>
            <label className="block text-sm text-gray-500 mb-1">Manzil</label>
            <div className="flex gap-2">
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded-lg px-3 py-3 bg-gray-50 w-full outline-none text-sm" placeholder="Manzil..." />
                <button onClick={handleGetLocation} className="bg-blue-100 text-blue-600 p-3 rounded-lg"><MapPin size={24} /></button>
            </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
        </button>
      </div>
      <BottomNav />
    </main>
  );
}
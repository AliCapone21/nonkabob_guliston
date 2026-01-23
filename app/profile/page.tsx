// app/profile/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, Phone, Loader2, User as UserIcon, 
  ChevronRight, Building2, FileText, Globe, 
  ArrowLeft, LogIn, PhoneCall, AlertTriangle, Send
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+998");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'guest' | 'form'>('guest');
  
  // Loading states
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      // Small delay to ensure Telegram SDK is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      let telegramUser = null;
      let inTelegram = false;

      if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1");

        try {
          // Import SDK
          const WebApp = (await import('@twa-dev/sdk')).default;
          WebApp.ready();
          WebApp.expand();

          // Relaxed Check: If initData exists, we are in Telegram
          if (WebApp.initData || WebApp.initDataUnsafe?.user) {
            inTelegram = true;
            telegramUser = WebApp.initDataUnsafe.user;
          }
          
        } catch (e) {
          console.log("Error loading SDK:", e);
        }

        // Fallback for Localhost
        if (!inTelegram && isLocalhost) {
          telegramUser = { id: 123456, first_name: "Test User (Localhost)" };
          inTelegram = true; 
        }
      }

      setIsTelegram(inTelegram);
      
      if (telegramUser) {
        setUser(telegramUser);
        checkUserExists(telegramUser.id);
      }
      
      setIsChecking(false); // Stop loading screen
    };

    initProfile();
  }, []);

  async function checkUserExists(telegramId: number) {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', telegramId).single();
    if (data && data.phone_number) {
      // User exists and has phone -> Show data
      setPhone(data.phone_number);
      setAddress(data.address_text || "");
      setView('form'); 
    } else {
      // User is new OR has no phone -> Go to form so they can click the button
      setView('form');
    }
  }

  // --- THE NATIVE BUTTON TRIGGER ---
  const handleRequestContact = async () => {
    if (typeof window !== 'undefined') {
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // This is the Legal Way: Triggered by a user click function
        WebApp.requestContact((success: boolean, event: any) => {
            if (success) {
                // Some versions of Telegram return the contact object here
                if(event?.response?.contact?.phone_number) {
                    setPhone(event.response.contact.phone_number);
                } else {
                    // If not, we just assume success and ask them to verify
                    alert("Raqam yuborildi! Iltimos, saqlash tugmasini bosing.");
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
        (error) => {
          console.error(error);
          setAddress(""); 
        }
      );
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

  // --- STATE 1: CHECKING ---
  if (isChecking) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </main>
    );
  }

  // --- STATE 2: ERROR ---
  if (!isTelegram) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-orange-100 p-4 rounded-full mb-4">
            <AlertTriangle className="text-orange-500" size={40} />
        </div>
        <h1 className="font-bold text-xl mb-2">Xatolik</h1>
        <p className="text-gray-500 text-sm">
            Telegram ma'lumotlari yuklanmadi.
        </p>
      </main>
    );
  }

  // --- STATE 3: GUEST MENU ---
  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 p-4">
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

  // --- STATE 4: FORM ---
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
        
        {/* PHONE SECTION */}
        <div>
            <label className="block text-sm text-gray-500 mb-2">Telefon raqam</label>
            
            {/* 1. THE BIG SHARE BUTTON (Only shows if phone is empty/short) */}
            {phone.length < 5 && (
                <button 
                    onClick={handleRequestContact}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mb-3 flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                    <Send size={20} />
                    Raqamni yuborish (Telegram)
                </button>
            )}

            {/* 2. MANUAL INPUT */}
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
            {phone.length < 5 && (
                <p className="text-xs text-center text-gray-400 mt-2">yoki qo'lda kiriting</p>
            )}
        </div>

        {/* LOCATION SECTION */}
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
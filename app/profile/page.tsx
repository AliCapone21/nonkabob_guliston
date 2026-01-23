// app/profile/page.tsx
"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MapPin, Phone, Loader2, User as UserIcon, 
  ChevronRight, ArrowLeft, LogIn, Send, AlertTriangle
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("+998");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'guest' | 'form'>('guest');
  
  // Controls showing the big green "Share Phone" button
  const [needsPhone, setNeedsPhone] = useState(false);

  // Loading states
  const [isChecking, setIsChecking] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      // Small delay to ensure Telegram is injected
      await new Promise(resolve => setTimeout(resolve, 500));

      let telegramUser = null;
      let inTelegram = false;

      if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1");

        try {
          const WebApp = (await import('@twa-dev/sdk')).default;
          WebApp.ready();
          WebApp.expand();

          if (WebApp.initDataUnsafe?.user) {
            telegramUser = WebApp.initDataUnsafe.user;
            inTelegram = true;
          }
        } catch (e) {
          console.log("Error loading SDK:", e);
        }

        // Localhost Fallback
        if (!telegramUser && isLocalhost) {
          telegramUser = { id: 123456, first_name: "Test User (Localhost)" };
          inTelegram = true; 
        }
      }

      setIsTelegram(inTelegram);
      setIsChecking(false);

      if (telegramUser) {
        setUser(telegramUser);
        checkUserExists(telegramUser.id);
      }
    };

    initProfile();
  }, []);

  async function checkUserExists(telegramId: number) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (data) {
      if (data.phone_number && data.phone_number.length > 5) {
        setPhone(data.phone_number);
        setAddress(data.address_text || "");
        setView('form');
        setNeedsPhone(false);
      } else {
        // User exists but has no phone -> Go to form, Ask for phone
        setView('form');
        setNeedsPhone(true);
      }
    } else {
      // New User -> Go to form, Ask for phone
      setView('form');
      setNeedsPhone(true);
      // Optional: Ask for location immediately for new users
      setTimeout(handleGetLocation, 1000);
    }
  }

  // --- FIXED FUNCTION: Actually captures the phone number ---
  const requestContact = () => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.requestContact((success: boolean, event: any) => {
        if (success) {
          // 1. Try to get number from the event response
          const sharedPhone = event?.response?.contact?.phone_number;
          
          if (sharedPhone) {
             // Telegram numbers sometimes come without '+', so we add it
             const formatted = sharedPhone.startsWith('+') ? sharedPhone : `+${sharedPhone}`;
             setPhone(formatted);
             setNeedsPhone(false); // Hide the big button
             alert("Raqam qabul qilindi!");
          } else {
             // If event is empty, just alert (backup plan)
             alert("Raqam yuborildi! Iltimos, uni pastda tekshiring.");
          }
        }
      });
    } else {
      alert("Telegram API topilmadi.");
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
    else {
      alert("Muvaffaqiyatli saqlandi!");
      setNeedsPhone(false);
    }
  }

  // --- UI STATES ---

  if (isChecking) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <p className="text-gray-500 text-sm">Yuklanmoqda...</p>
      </main>
    );
  }

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

  // Guest View (Only shown if user manually clicks "Back" or logic fails)
  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-20 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="text-orange-500" size={32} />
          </div>
          <h2 className="font-bold text-lg mb-2">Profilga kirish</h2>
          <button 
            onClick={() => setView('form')}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Kirish
          </button>
        </div>
        <BottomNav />
      </main>
    );
  }

  // Form View
  return (
    <main className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Ma'lumotlarni kiritish</h1>
      </div>

      {/* The "Needs Phone" Box */}
      {needsPhone && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4 text-center">
          <p className="text-sm text-green-800 mb-3 font-medium">
            Buyurtma berish uchun telefon raqamingiz kerak.
          </p>
          <button
            onClick={requestContact}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
          >
            <Send size={18} />
            Raqamni Telegramdan ulashish
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
            <UserIcon size={40} className="text-gray-400" />
          </div>
          <h2 className="font-bold text-gray-800">{user?.first_name}</h2>
          <p className="text-gray-500 text-sm">ID: {user?.id}</p>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Telefon raqam</label>
          <div className="flex gap-2">
            <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50 flex-grow focus-within:ring-2 ring-green-200">
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
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Manzil</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded-lg px-3 py-3 bg-gray-50 w-full outline-none text-sm"
            />
            <button 
              onClick={handleGetLocation}
              className="bg-blue-100 text-blue-600 p-3 rounded-lg active:scale-95"
            >
              <MapPin size={24} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Saqlash"}
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
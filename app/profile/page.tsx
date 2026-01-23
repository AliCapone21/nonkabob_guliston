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
          
          // --- AUTO REQUEST PHONE NUMBER ---
          // This triggers the native Telegram popup you wanted!
          if (inTelegram && telegramUser) {
             // Only ask if we haven't saved it yet (optional check, or just always ask)
             WebApp.requestContact((success: boolean, response: any) => {
                if (success) {
                   // Note: 'response' might contain the contact string in some versions,
                   // but often it just signals success. The user still needs to confirm.
                   // Ideally, we would read the contact from the event, but for now 
                   // we just let them know it worked and focus the input.
                   console.log("User agreed to share contact");
                }
             });
          }

        } catch (e) {
          console.log("Error loading SDK:", e);
        }

        // Fallback for Localhost
        if (!inTelegram && isLocalhost) {
          console.log("Localhost detected - using Test User");
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
      setPhone(data.phone_number);
      setAddress(data.address_text || "");
      setView('form'); 
    } else {
      // New user? Go straight to form and ask for location!
      setView('form');
      setTimeout(handleGetLocation, 1000); // Ask for location after 1 second
    }
  }

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
            Telegram ma'lumotlari yuklanmadi. Iltimos, ilovani qaytadan oching.
        </p>
      </main>
    );
  }

  // --- STATE 3: FORM (We skip Guest view now for speed) ---
  return (
    <main className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="flex items-center mb-6">
        {/* Only show back button if we have a Guest view (optional) */}
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
            <div className="flex gap-2">
                <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50 focus-within:ring-2 ring-orange-200 transition-all flex-grow">
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

        {/* Location Input */}
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
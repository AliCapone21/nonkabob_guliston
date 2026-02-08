"use client";

import BottomNav from "@/components/BottomNav";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/context/LanguageContext"; // ✅ Use the global context
import { 
  MapPin, Phone, Loader2, User as UserIcon, 
  ArrowLeft, Send, LogIn, CheckCircle2,
  Building2, FileText, ShieldCheck, PhoneCall,
  Instagram, Copy, Check
} from "lucide-react";

const TelegramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.863 1.13c-1.11.426-1.756.67-2.198.855-.436.182-.88.397-1.127.818-.124.211-.19.458-.19.71 0 .538.29.897.808 1.137.45.21 1.05.412 1.83.655 1.558.486 3.118.973 4.678 1.458l2.04 6.35c.164.51.52 1.05 1.045 1.05.29 0 .57-.13.785-.36l2.365-2.54 4.185 3.09c.67.49 1.48.51 2.05.04.57-.47.88-1.28.66-2.14l-2.73-10.73a2.27 2.27 0 0 0-2.115-1.68z" />
  </svg>
);

declare global {
  interface Window {
    Telegram: any;
  }
}

type ViewState = 'guest' | 'form' | 'branches' | 'about' | 'privacy' | 'contact';

export default function ProfilePage() {
  // ✅ GLOBAL STATE: Connect to your LanguageProvider
  const { language, setLanguage, t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(""); 
  const [phone, setPhone] = useState("+998");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<ViewState>('guest');
  const [needsPhone, setNeedsPhone] = useState(false);
  const [copied, setCopied] = useState(false);

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
      if (data.phone_number && data.phone_number.length > 9) {
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
      setView('guest');
    }
  }

  const requestContact = useCallback(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.requestContact((success: boolean, event: any) => {
        if (success) {
          const contactData = event?.response?.contact || event?.contact || event?.responseUnsafe?.contact;
          if (contactData && contactData.phone_number) {
            let rawPhone = contactData.phone_number;
            let cleanPhone = rawPhone.replace(/\D/g, ''); 
            if (!cleanPhone.startsWith('998')) {
              alert("Faqat O'zbekiston raqamlari qabul qilinadi.");
              return;
            }
            const finalPhone = `+${cleanPhone}`;
            setPhone(finalPhone);
            setNeedsPhone(false);
            saveProfileDirectly(finalPhone); 
          } else {
            alert("Raqam yuborildi! Iltimos, uni quyida yozib tasdiqlang.");
            setNeedsPhone(false);
          }
        }
      });
    }
  }, [name, address, location, user]);

  async function saveProfileDirectly(phoneValue: string) {
    if (!user) return;
    setLoading(true);
    const updates = {
      telegram_id: user.id,
      full_name: name,
      phone_number: phoneValue,
      address_text: address, 
      latitude: location?.lat,
      longitude: location?.lng,
    };
    const { error } = await supabase.from('users').upsert(updates);
    setLoading(false);
    if (!error) handleGetLocation();
  }

  function handleGetLocation() {
    if ("geolocation" in navigator) {
      setAddress(t.location_btn);
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
    const cleanManual = phone.replace(/\D/g, '');
    if (!cleanManual.startsWith("998") || cleanManual.length < 12) { 
      alert("Iltimos, to'g'ri O'zbekiston raqamini kiriting (+998...)"); 
      return; 
    }
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) val = "+998";
    if (val.length > 13) return;
    setPhone(val);
  };

  // --- SUB-PAGES ---
  if (view === 'branches') {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t.branch_title}</h1>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-500">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{t.branch_name}</h3>
            <p className="text-xs text-gray-500">09:00 - 23:00</p>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (view === 'about') {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t.about_title}</h1>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="text-orange-500" size={40} />
          </div>
          <h2 className="font-bold text-lg mb-2">NonKabob Guliston</h2>
          <p className="text-gray-600">{t.about_text}</p>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (view === 'privacy') {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t.privacy_title}</h1>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 leading-relaxed text-sm">
            {t.privacy_text}
          </p>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (view === 'contact') {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center mb-6">
          <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t.contact_title}</h1>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <PhoneCall className="text-green-500" size={40} />
          </div>
          <h2 className="font-bold text-xl mb-1">+998 (93) 117 64 00</h2>
          <p className="text-gray-400 text-sm mb-6">Guliston NonKabob Call Center</p>
          
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:+998931176400" className="bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95">
              <PhoneCall size={18} /> Call
            </a>
            <button 
              onClick={() => {
                navigator.clipboard.writeText("+998931176400");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="bg-gray-100 text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? t.copied : t.contact_copy}
            </button>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  // --- VIEW: GUEST ---
  if (view === 'guest') {
    return (
      <main className="min-h-screen bg-gray-50 pb-24 p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <LogIn className="text-orange-500" size={32} />
          </div>
          <h2 className="font-bold text-lg mb-2">{t.login_title}</h2>
          <p className="text-gray-500 text-sm mb-6 px-4">{t.login_desc}</p>
          <button 
            onClick={() => {
              setView('form');
              setNeedsPhone(true);
              setTimeout(requestContact, 500);
            }} 
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold active:scale-95 mb-3"
          >
            {t.login_btn}
          </button>
          <button 
            onClick={() => setView('contact')}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95"
          >
            <PhoneCall size={20} />
            {t.call_btn}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <MenuItem icon={Building2} label={t.menu_branches} onClick={() => setView('branches')} />
          <MenuItem icon={FileText} label={t.menu_about} onClick={() => setView('about')} />
          <MenuItem icon={ShieldCheck} label={t.menu_privacy} onClick={() => setView('privacy')} />
        </div>

        {/* ✅ REVISED LANGUAGE SWITCHER: Now triggers global state */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex justify-between items-center">
          <span className="font-medium text-gray-700">{t.lang_label}</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setLanguage('uz')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${language === 'uz' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>UZ</button>
            <button onClick={() => setLanguage('ru')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${language === 'ru' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>RU</button>
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${language === 'en' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>EN</button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-xs mb-3">{t.social_label}</p>
          <div className="flex justify-center gap-4">
            <a href="https://instagram.com" target="_blank" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-pink-600 active:scale-90 transition-transform">
              <Instagram size={20} />
            </a>
            <a href="https://t.me/nonkabob_guliston" target="_blank" className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 active:scale-90 transition-transform">
              <TelegramIcon size={20} />
            </a>
          </div>
          <p className="text-gray-300 text-[10px] mt-4">v1.0.0 by NonKabob</p>
        </div>

        <BottomNav />
      </main>
    );
  }

  // --- VIEW: FORM ---
  return (
    <main className="min-h-screen bg-gray-50 pb-20 p-4">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('guest')} className="mr-4 p-2 bg-white rounded-full shadow-sm text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">{t.form_title}</h1>
      </div>

      {needsPhone && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-4 text-center">
          <p className="text-sm text-green-800 mb-3 font-medium">{t.phone_label} kerak.</p>
          <button onClick={requestContact} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95">
            <Send size={18} /> {t.share_phone}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm text-gray-500 mb-1">{t.name_label}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-3 bg-gray-50 outline-none text-lg font-medium" />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">{t.phone_label}</label>
          <div className="flex items-center border rounded-lg px-3 py-3 bg-gray-50">
            <Phone size={18} className="text-gray-400 mr-2" />
            <input type="tel" value={phone} onChange={handlePhoneChange} className="bg-transparent w-full outline-none text-lg font-medium" />
            {!needsPhone && <CheckCircle2 size={20} className="text-green-500 ml-2" />}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">{t.address_label}</label>
          <div className="flex gap-2">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded-lg px-3 py-3 bg-gray-50 w-full outline-none text-sm" placeholder={t.address_placeholder} />
            <button onClick={handleGetLocation} className="bg-blue-100 text-blue-600 p-3 rounded-lg"><MapPin size={24} /></button>
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95">
          {loading ? <Loader2 className="animate-spin" size={20} /> : t.save_btn}
        </button>
      </div>
      <BottomNav />
    </main>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 active:bg-gray-50 cursor-pointer">
      <div className="flex items-center gap-3 text-gray-600">
        <Icon size={20} className="text-gray-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ArrowLeft size={16} className="text-gray-400 rotate-180" />
    </div>
  )
}
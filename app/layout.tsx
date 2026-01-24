// app/layout.tsx
"use client"; // <--- 1. Mark as Client Component

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext"; // <--- 2. Import Language Context
import WelcomeGate from "@/components/WelcomeGate";
import Script from "next/script";
import { useState, useEffect } from "react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- 3. SPLASH SCREEN COMPONENT ---
// This component sits inside the LanguageProvider, so it can use the "useLanguage" hook.
function AppContent({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, isLoaded } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // If language is loaded and already saved in phone, skip splash
    if (isLoaded) {
      const saved = localStorage.getItem('app_language');
      if (saved) {
        setShowSplash(false);
      }
    }
  }, [isLoaded]);

  const handleSelect = (lang: 'uz' | 'ru' | 'en') => {
    setLanguage(lang);
    setShowSplash(false); // Hide splash after selection
  };

  // Wait for context to load before showing anything
  if (!isLoaded) return null; 

  return (
    <>
      {/* LANGUAGE SPLASH SCREEN (Overlay) */}
      {showSplash && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
             <span className="text-4xl">🌍</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">
            Tilni tanlang
          </h1>
          <p className="text-gray-500 mb-8 text-center">Выберите язык / Select language</p>
          
          <div className="w-full max-w-xs space-y-3">
            <button 
              onClick={() => handleSelect('uz')}
              className="w-full py-4 bg-white border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-3"
            >
              🇺🇿 O'zbekcha
            </button>
            <button 
              onClick={() => handleSelect('ru')}
              className="w-full py-4 bg-white border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-3"
            >
              🇷🇺 Русский
            </button>
            <button 
              onClick={() => handleSelect('en')}
              className="w-full py-4 bg-white border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-3"
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      )}

      {/* REAL APP CONTENT (Hidden behind splash until chosen) */}
      <div className={showSplash ? "hidden" : "block"}>
        {children}
      </div>
    </>
  );
}

// --- 4. MAIN LAYOUT ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>NonKabob Guliston</title>
        <meta name="description" content="Order food online" />
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the whole app in Providers */}
        <LanguageProvider>
          <CartProvider>
           <AppContent>
  <WelcomeGate>{children}</WelcomeGate>
</AppContent>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
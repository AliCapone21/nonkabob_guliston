// context/LanguageContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, LangType } from "@/lib/translations";

type LanguageContextType = {
  language: LangType;
  setLanguage: (lang: LangType) => void;
  t: typeof translations['uz'];
  isLoaded: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LangType>('uz');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if we saved language before
    const saved = localStorage.getItem('app_language') as LangType;
    if (saved && (saved === 'uz' || saved === 'ru' || saved === 'en')) {
      setLanguageState(saved);
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: LangType) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang); // Save to phone
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
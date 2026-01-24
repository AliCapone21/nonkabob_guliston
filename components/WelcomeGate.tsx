// components/WelcomeGate.tsx
"use client";

import { useEffect, useState } from "react";

export default function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("seen_welcome");
    if (!seen) setShow(true);
    setReady(true);
  }, []);

  const handleContinue = () => {
    localStorage.setItem("seen_welcome", "1");
    setShow(false);
  };

  if (!ready) return null;

  if (show) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-gray-700 text-sm mb-4">
            Buyurtma berish uchun quyidagi <b>&quot;Menyuni ko&apos;rish&quot;</b> tugmasini bosing.
          </p>

          <button
            onClick={handleContinue}
            className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Menyuni ko&apos;rish
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

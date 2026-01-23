// context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Define what an item in the cart looks like
type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  totalPrice: number;
  getItemCount: (id: number) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increase quantity
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If new item, add it with quantity 1
      return [...currentItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity
        return currentItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // Remove completely
      return currentItems.filter(item => item.id !== id);
    });
  };

  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const getItemCount = (id: number) => {
    const item = items.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, totalPrice, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
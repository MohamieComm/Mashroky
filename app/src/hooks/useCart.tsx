import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  details?: string;
  image?: string | null;
  type?: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "mashrouk-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "id"> & { id?: string }) => {
    const numericPrice = Number(String(item.price).replace(/[^\d.]/g, "")) || 0;
    const id = item.id ?? `${item.title}-${Date.now()}`;
    setItems((prev) => [...prev, { ...item, id, price: numericPrice }]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

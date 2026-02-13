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
const fallbackTitleByType: Record<string, string> = {
  flight: "حجز طيران",
  hotel: "حجز فندق",
  car: "حجز سيارة",
  tour: "حجز جولة",
  transfer: "حجز نقل",
  activity: "حجز نشاط",
  offer: "عرض سياحي",
  service: "خدمة سياحية",
};

const cleanText = (value: string | undefined, fallback: string) => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return text;
};

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
    const type = (item.type || "service").toLowerCase();
    const title = cleanText(item.title, fallbackTitleByType[type] || fallbackTitleByType.service);
    const id = item.id ?? `${type}-${Date.now()}`;
    const details = cleanText(item.details, "تفاصيل الحجز متاحة بعد الإضافة");
    setItems((prev) => [...prev, { ...item, id, type, title, details, price: numericPrice }]);
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

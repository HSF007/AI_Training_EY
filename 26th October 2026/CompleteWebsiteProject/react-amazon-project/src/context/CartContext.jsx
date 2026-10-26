import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "shopnest-cart";

function readCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addToCart(product, quantity = 1) {
    const amount = Math.max(1, Math.floor(Number(quantity) || 1));
    setItems((current) => {
      const id = String(product.id);
      const existing = current.find((item) => String(item.id) === id);
      if (existing) {
        return current.map((item) =>
          String(item.id) === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        );
      }
      return [...current, { ...product, quantity: amount }];
    });
  }

  function setQuantity(id, quantity) {
    const amount = Math.floor(Number(quantity));
    if (!Number.isFinite(amount) || amount < 1) {
      removeFromCart(id);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        String(item.id) === String(id) ? { ...item, quantity: amount } : item
      )
    );
  }

  function removeFromCart(id) {
    setItems((current) => current.filter((item) => String(item.id) !== String(id)));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const value = useMemo(
    () => ({ items, addToCart, setQuantity, removeFromCart, clearCart, itemCount, subtotal }),
    [items, itemCount, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

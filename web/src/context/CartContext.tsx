import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const refreshCart = async () => {
    if (!user) {
      setItems([]);
      setTotal(0);
      return;
    }
    try {
      const data = await apiFetch('/cart');
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      // Ignored if unauthenticated
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addItem = async (productId: string, quantity = 1) => {
    const data = await apiFetch('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    setItems(data.items);
    setTotal(data.total);
  };

  const updateQty = async (productId: string, quantity: number) => {
    const data = await apiFetch(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setItems(data.items);
    setTotal(data.total);
  };

  const removeItem = async (productId: string) => {
    const data = await apiFetch(`/cart/items/${productId}`, { method: 'DELETE' });
    setItems(data.items);
    setTotal(data.total);
  };

  const clearCart = async () => {
    await apiFetch('/cart', { method: 'DELETE' });
    setItems([]);
    setTotal(0);
  };

  return (
    <CartContext.Provider value={{ items, total, addItem, updateQty, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

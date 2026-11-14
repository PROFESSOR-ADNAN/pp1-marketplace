import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
  category?: { name: string };
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('souq_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('souq_wishlist', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [items]);

  const toggleWishlist = (product: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i._id === product._id);
      if (exists) {
        return prev.filter((i) => i._id !== product._id);
      }
      return [...prev, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i._id !== productId));
  };

  const isWishlisted = (productId: string) => {
    return items.some((i) => i._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isWishlisted,
        removeItem,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

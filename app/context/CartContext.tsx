'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Product } from '../types';

// The API returns populated product data, so we need a different structure for the cart items in the context
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  // #region Utility Functions
  const getLocalCart = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  };

  const saveLocalCart = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };
  // #endregion

  // #region API Callbacks
  const syncWithDb = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const dbCart = await response.json();
        // The API returns { items: [{ productId: {...}, quantity: ... }] }
        // We need to transform it to the context's CartItem structure
        const formattedItems = dbCart.items.map((item: any) => ({
          product: item.productId,
          quantity: item.quantity,
        }));
        setItems(formattedItems);
        saveLocalCart(formattedItems); // Keep local storage in sync
      }
    } catch (error) {
      console.error('Failed to fetch cart from DB:', error);
    } finally {
      setLoading(false);
    }
  }, [status]);
  
  const mergeCarts = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      await syncWithDb(); // just sync if local is empty
      return;
    }
    
    setLoading(true);
    try {
      // Push all local items to the DB
      for (const item of localCart) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id, // Assumes product has _id
            quantity: item.quantity,
          }),
        });
      }
      // Clear local cart and then fetch the now-merged cart from DB
      localStorage.removeItem('cart');
      await syncWithDb();
    } catch (error) {
      console.error('Failed to merge carts:', error);
      setLoading(false);
    }
  }, [syncWithDb]);

  // Effect to initialize cart on auth status change
  useEffect(() => {
    if (status === 'loading') return; // Wait until session status is resolved

    if (status === 'authenticated' && !isInitialized.current) {
      mergeCarts();
      isInitialized.current = true;
    } else if (status === 'unauthenticated') {
      setItems(getLocalCart());
      setLoading(false);
      isInitialized.current = false; // Reset for next login
    }
  }, [status, mergeCarts]);
  // #endregion

  // #region Cart Actions
  const addItem = async (product: Product, quantity = 1) => {
    const existingItem = items.find(item => item.product.id === product.id);
    const newQuantity = (existingItem?.quantity || 0) + quantity;
    await updateItemQuantity(product.id, newQuantity);
  };

  const removeItem = async (productId: string) => {
    await updateItemQuantity(productId, 0); // Setting quantity to 0 or less removes it
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (status === 'authenticated') {
      try {
        const method = quantity > 0 ? 'POST' : 'DELETE';
        const body = quantity > 0 ? { productId, quantity } : { productId };
        
        const response = await fetch(`/api/cart${method === 'DELETE' ? `?productId=${productId}`: ''}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' ? JSON.stringify(body) : undefined,
        });

        if (response.ok) {
          const updatedCart = await response.json();
           const formattedItems = updatedCart.items.map((item: any) => ({
             product: item.productId,
             quantity: item.quantity,
           }));
           setItems(formattedItems);
           saveLocalCart(formattedItems);
        }
      } catch (error) {
        console.error('Failed to update DB cart:', error);
      }
    } else {
      // Unauthenticated: update local state and localStorage
      let updatedItems;
      if (quantity > 0) {
        const existingItem = items.find(item => item.product.id === productId);
        if (existingItem) {
          updatedItems = items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          );
        } else {
          // This case should be handled by addItem, but as a fallback:
          const productResponse = await fetch(`/api/products?id=${productId}`);
          if (productResponse.ok) {
            const productToAdd = await productResponse.json();
            updatedItems = [...items, { product: productToAdd, quantity }];
          } else {
            updatedItems = items; // product not found
          }
        }
      } else {
        updatedItems = items.filter(item => item.product.id !== productId);
      }
      setItems(updatedItems);
      saveLocalCart(updatedItems);
    }
  };

  const clearCart = async () => {
    if (status === 'authenticated') {
      try {
        // This would require a new API endpoint, e.g., DELETE /api/cart/all
        // For now, we remove items one by one.
        for (const item of items) {
          await fetch(`/api/cart?productId=${item.product.id}`, { method: 'DELETE' });
        }
      } catch (error) {
        console.error('Failed to clear DB cart', error);
      }
    }
    setItems([]);
    saveLocalCart([]);
  };
  // #endregion

  // #region Derived State
  const total = items.reduce((sum, item) => sum + (item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  // #endregion

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItemQuantity, clearCart, total, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

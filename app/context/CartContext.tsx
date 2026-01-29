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
  toastMessage: string | null; // Add toast message to context type
  showToast: (message: string) => void; // Add showToast function to context type
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Utility Functions
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

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000); // Hide after 3 seconds
  }, []); // showToast depends only on setToastMessage and clearTimeout which are stable

  // Cart Actions - defined here to access showToast and internal state directly
  const updateItemQuantity = async (productId: string, quantity: number) => {
    // First, fetch the latest product info to get current stock
    const productResponse = await fetch(`/api/products/${productId}`);
    if (!productResponse.ok) {
      showToast('Could not verify product stock. Please try again.');
      return;
    }
    const currentProduct: Product = await productResponse.json();

    if (quantity > currentProduct.stock) {
      showToast(`Only ${currentProduct.stock} items of ${currentProduct.name} available.`);
      return;
    }

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
          updatedItems = [...items, { product: currentProduct, quantity }];
        }
      } else {
        updatedItems = items.filter(item => item.product.id !== productId);
      }
      setItems(updatedItems);
      saveLocalCart(updatedItems);
    }
  };

  const addItem = async (product: Product, quantity = 1) => {
    const existingItem = items.find(item => item.product.id === product.id);
    const newQuantity = (existingItem?.quantity || 0) + quantity;
    await updateItemQuantity(product.id, newQuantity);
    showToast(`${product.name} added to cart!`);
  };

  const removeItem = async (productId: string) => {
    await updateItemQuantity(productId, 0); // Setting quantity to 0 or less removes it
  };

  const clearCart = async () => {
    if (status === 'authenticated') {
      try {
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

  // API Callbacks
  const syncWithDb = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const dbCart = await response.json();
        const formattedItems = dbCart.items.map((item: any) => ({
          product: item.productId,
          quantity: item.quantity,
        }));
        setItems(formattedItems);
        saveLocalCart(formattedItems);
      }
    } catch (error) {
      console.error('Failed to fetch cart from DB:', error);
    } finally {
      setLoading(false);
    }
  }, [status, saveLocalCart]); // Added saveLocalCart to dependencies
  
  const mergeCarts = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      await syncWithDb();
      return;
    }
    
    setLoading(true);
    try {
      for (const item of localCart) {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
          }),
        });
      }
      localStorage.removeItem('cart');
      await syncWithDb();
    } catch (error) {
      console.error('Failed to merge carts:', error);
      setLoading(false);
    }
  }, [syncWithDb, getLocalCart]); // Added getLocalCart to dependencies

  // Effect to initialize cart on auth status change
  useEffect(() => {
    // TEMPORARILY DISABLED TO PREVENT DB ERRORS
    // if (status === 'loading') return;

    // if (status === 'authenticated' && !isInitialized.current) {
    //   mergeCarts();
    //   isInitialized.current = true;
    // } else if (status === 'unauthenticated') {
    //   setItems(getLocalCart());
    //   setLoading(false);
    //   isInitialized.current = false;
    // }
  }, [status, mergeCarts]);

  // Derived State
  const total = items.reduce((sum, item) => sum + (item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);


  // #endregion

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItemQuantity, clearCart, total, itemCount, loading, toastMessage, showToast }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

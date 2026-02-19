'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import type { Product } from '../types';

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
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getProductId = (product: Product): string => {
  return product._id || product.id || '';
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getLocalCart = useCallback((): CartItem[] => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  }, []);

  const saveLocalCart = useCallback((cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const updateItemQuantity = useCallback(async (productId: string, quantity: number) => {
    const productResponse = await fetch(`/api/products/${productId}`);
    if (!productResponse.ok) {
      showToast('Could not verify product stock. Please try again.');
      return;
    }
    const currentProduct: Product = await productResponse.json();
    const currentProductId = getProductId(currentProduct);

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
          const formattedItems = updatedCart.items.map((item: { productId: Product; quantity: number }) => ({
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
      setItems(prevItems => {
        let updatedItems;
        if (quantity > 0) {
          const existingItemIndex = prevItems.findIndex(item => getProductId(item.product) === currentProductId);
          if (existingItemIndex >= 0) {
            updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity };
          } else {
            updatedItems = [...prevItems, { product: currentProduct, quantity }];
          }
        } else {
          updatedItems = prevItems.filter(item => getProductId(item.product) !== currentProductId);
        }
        saveLocalCart(updatedItems);
        return updatedItems;
      });
    }
  }, [status, showToast, saveLocalCart]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    const productId = getProductId(product);
    if (!productId) {
      showToast('Error: Invalid product');
      return;
    }
    
    const currentQuantity = items.find(item => getProductId(item.product) === productId)?.quantity || 0;
    const newQuantity = currentQuantity + quantity;
    await updateItemQuantity(productId, newQuantity);
    showToast(`${product.name} added to cart!`);
  }, [items, updateItemQuantity, showToast]);

  const removeItem = useCallback(async (productId: string) => {
    await updateItemQuantity(productId, 0);
  }, [updateItemQuantity]);

  const clearCart = useCallback(async () => {
    if (status === 'authenticated') {
      try {
        for (const item of items) {
          const productId = getProductId(item.product);
          await fetch(`/api/cart?productId=${productId}`, { method: 'DELETE' });
        }
      } catch (error) {
        console.error('Failed to clear DB cart', error);
      }
    }
    setItems([]);
    saveLocalCart([]);
  }, [status, items, saveLocalCart]);

  const syncWithDb = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const dbCart = await response.json();
        const formattedItems = (dbCart.items || []).map((item: { productId: Product; quantity: number }) => ({
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
  }, [status, saveLocalCart]);
  
  const mergeCarts = useCallback(async () => {
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      await syncWithDb();
      return;
    }
    
    setLoading(true);
    try {
      for (const item of localCart) {
        const productId = getProductId(item.product);
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            quantity: item.quantity,
          }),
        });
      }
      localStorage.removeItem('cart');
      await syncWithDb();
    } catch (error) {
      console.error('Failed to merge carts:', error);
    } finally {
      setLoading(false);
    }
  }, [getLocalCart, syncWithDb]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && !isInitialized.current) {
      mergeCarts();
      isInitialized.current = true;
    } else if (status === 'unauthenticated') {
      const localCart = getLocalCart();
      setItems(localCart);
      setLoading(false);
      isInitialized.current = false;
    }
  }, [status, mergeCarts, getLocalCart]);

  const total = items.reduce((sum, item) => sum + (item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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

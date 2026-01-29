'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from './CartContext';

import { SocketProvider } from './SocketProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </CartProvider>
    </SessionProvider>
  );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import SocketContext from './SocketContext';
import { useSession } from 'next-auth/react';
import { useCart } from './CartContext'; // For showToast

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { data: session } = useSession();
  const { showToast } = useCart();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SOCKET_IO_URL!
      : 'http://localhost:3001';

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false,
    });

    newSocket.on('connect', () => {
      console.log('Socket.IO client connected:', newSocket.id);
      if (session?.user?.id) {
        newSocket.emit('authenticateUser', session.user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO client disconnected');
    });

    // Handle global bid updates if needed
    // newSocket.on('bidUpdated', (updatedAuction: any) => {
    //   console.log('Global bid update received:', updatedAuction);
    //   // Potentially dispatch a global state update or re-fetch data
    // });

    newSocket.on('outbidNotification', (data: { auctionId: string; newBidAmount: number; auctionName: string }) => {
      if (session?.user?.id) { // Only show if logged in
        showToast(`You have been outbid on ${data.auctionName}! New bid: R${data.newBidAmount}`);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id, showToast]);

  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.emit('authenticateUser', session.user.id);
    }
  }, [socket, session?.user?.id]);


  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

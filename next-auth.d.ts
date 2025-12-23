import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { NextRequest } from 'next/server'; // Import NextRequest
import { UserRole } from './app/types'; // Import UserRole

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string; // Add name
      email: string; // Add email
      role: UserRole; // Use UserRole enum
      isApprovedForAuction: boolean; // Add approval status
      watchlist: string[]; // Add watchlist
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    name: string; // Add name
    email: string; // Add email
    role: UserRole; // Use UserRole enum
    isApprovedForAuction: boolean; // Add approval status
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    name: string; // Add name
    email: string; // Add email
    role: UserRole; // Use UserRole enum
    isApprovedForAuction: boolean; // Add approval status
  }
}

// Augment NextRequest for middleware
declare module 'next/server' {
  interface NextRequest {
    nextauth: {
      token: JWT;
    };
  }
}

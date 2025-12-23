import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

if (token?.role === 'TEAM_ADMIN' && req.nextUrl.pathname.startsWith('/user-profile')) {
      return NextResponse.redirect(new URL('/admin-dashboard', req.url));
    }

    // Redirect non-admins trying to access admin routes
    if (token?.role !== 'TEAM_ADMIN' && req.nextUrl.pathname.startsWith('/admin-dashboard')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/user-profile', '/admin-dashboard'],
};

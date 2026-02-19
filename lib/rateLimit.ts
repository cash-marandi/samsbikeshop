import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = config;

  return (req: NextRequest): NextResponse | null => {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const key = `${ip}:${req.nextUrl.pathname}`;
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null;
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return NextResponse.json(
        { message, retryAfter: Math.ceil((store[key].resetTime - now) / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((store[key].resetTime - now) / 1000)) } }
      );
    }

    return null;
  };
}

export function cleanupRateLimitStore() {
  const now = Date.now();
  for (const key in store) {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  }
}

setInterval(cleanupRateLimitStore, 60000);

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests. Please slow down.',
});

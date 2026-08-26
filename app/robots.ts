import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin-dashboard',
          '/user-profile',
          '/login',
          '/signup',
          '/team-login',
          '/team-register',
          '/cart',
          '/checkout',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://samsbikeshop.co.za/sitemap.xml',
  }
}

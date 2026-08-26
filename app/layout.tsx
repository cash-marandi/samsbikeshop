import type { Metadata } from 'next'
import { Oswald, Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import Providers from './context/Providers'
import ToastDisplay from './components/ToastDisplay';
import { PageTransition } from './components/PageTransition'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Sams Bike Shop | Premium Cycles & Expert Repairs',
  description: 'Premium cycles, expert repairs, and real-time auctions. Your ultimate cycling destination since 1998.',
  keywords: 'bike shop, bicycles, cycling, repairs, auctions, rentals, South Africa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-body bg-ink-50 text-ink-950 antialiased">
        <Providers>
          <Navbar />
          <PageTransition>
            <main className="flex-grow">
              {children}
            </main>
          </PageTransition>
          <Footer />
          <ToastDisplay />
        </Providers>
      </body>
    </html>
  )
}

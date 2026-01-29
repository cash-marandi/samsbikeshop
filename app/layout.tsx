import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import Providers from './context/Providers'
import ToastDisplay from './components/ToastDisplay';

export const metadata: Metadata = {
  title: 'Sams Bike Shop | Buy, Rent, Auction',
  description: 'Premium cycles, expert repairs, and real-time auctions. Your ultimate cycling destination since 1998.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-900">
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ToastDisplay />
        </Providers>
      </body>
    </html>
  )
}
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google' // Removed Inter import
import './globals.css'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import Providers from './context/Providers'

// const inter = Inter({ subsets: ['latin'] }) // Removed Inter instantiation

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
      <body className="font-sans bg-zinc-950 text-zinc-50"> {/* Changed className */}
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
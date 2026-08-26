import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Login | Sam's Bike Shop",
  description: 'Sign in to your Sam\'s Bike Shop account to manage orders, bids, and rentals.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Checkout | Sam's Bike Shop",
  description: 'Complete your purchase at Sam\'s Bike Shop.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

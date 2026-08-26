import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Shopping Cart | Sam's Bike Shop",
  description: 'Review your shopping cart at Sam\'s Bike Shop.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

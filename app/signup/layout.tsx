import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Sign Up | Sam's Bike Shop",
  description: 'Create your free Sam\'s Bike Shop account to start bidding, renting, and shopping.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

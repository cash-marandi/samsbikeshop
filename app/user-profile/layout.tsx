import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "My Profile | Sam's Bike Shop",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

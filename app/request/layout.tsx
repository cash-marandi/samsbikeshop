import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Request a Bike or Part | Sam's Bike Shop",
  description: 'Can\'t find what you\'re looking for? Request a specific bike or part and we\'ll source it for you at Sam\'s Bike Shop in Soweto.',
  openGraph: {
    title: "Request a Bike or Part | Sam's Bike Shop",
    description: 'Request a specific bike or part and we\'ll source it for you.',
    url: 'https://samsbikeshop.co.za/request',
    siteName: "Sam's Bike Shop",
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

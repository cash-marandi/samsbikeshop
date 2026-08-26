import { Metadata } from 'next'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { BreadcrumbJsonLd } from '../components/JsonLd'
import AuctionsPageContent from './AuctionsPageContent'

export const metadata: Metadata = {
  title: "Live Bike Auctions | Sam's Bike Shop - Bid on Premium Cycles",
  description: "Bid on premium bicycles, rare parts, and collector bikes at Sam's Bike Shop live auctions in Soweto, Gauteng. Real-time bidding with refundable R500 deposit.",
  keywords: "bike auction, bicycle auction, live auction, bid on bikes, soweto auction, cycling auction gauteng",
  openGraph: {
    title: "Live Bike Auctions | Sam's Bike Shop",
    description: "Bid on premium bicycles and rare cycling gear in Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za/auctions",
    siteName: "Sam's Bike Shop",
    type: "website",
  },
}

async function getAuctions() {
  try {
    const res = await fetch('http://localhost:3000/api/auctions', { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.auctions || []
  } catch { return [] }
}

export default async function AuctionsPage() {
  const auctions = await getAuctions()

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://samsbikeshop.co.za' },
        { name: 'Auctions', url: 'https://samsbikeshop.co.za/auctions' },
      ]} />
      <Breadcrumbs items={[{ label: 'Auctions' }]} />
      <AuctionsPageContent auctions={auctions} />
    </>
  )
}

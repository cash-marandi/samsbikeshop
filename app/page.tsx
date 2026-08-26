import { Metadata } from 'next';
import HomePageContent from './HomePageContent';
import { LocalBusinessJsonLd, OrganizationJsonLd, BreadcrumbJsonLd } from './components/JsonLd';

export const metadata: Metadata = {
  title: "Sam's Bike Shop | Premium Bicycles, Repairs & Auctions in Soweto",
  description: "Premium bicycles, expert repairs, bike rentals, and live auctions in Soweto, Gauteng. South Africa's premier cycling destination since 1998. Shop bikes, parts, and accessories.",
  keywords: "bike shop, bicycles, cycling, repairs, auctions, rentals, soweto, johannesburg, gauteng, south africa",
  openGraph: {
    title: "Sam's Bike Shop | Premium Bicycles, Repairs & Auctions",
    description: "Premium bicycles, expert repairs, bike rentals, and live auctions in Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za",
    siteName: "Sam's Bike Shop",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sam's Bike Shop | Premium Bicycles, Repairs & Auctions",
    description: "Premium bicycles, expert repairs, bike rentals, and live auctions in Soweto, Gauteng.",
  },
};

function getAuctionStatus(startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' {
  const now = Date.now();
  if (now < startTime) return 'UPCOMING';
  if (now > endTime) return 'ENDED';
  return 'LIVE';
}

async function getProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/products', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function getAuctions() {
  try {
    const res = await fetch('http://localhost:3000/api/auctions', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.auctions || []).map((auction: any) => {
      const startTime = new Date(auction.startTime).getTime();
      const endTime = new Date(auction.endTime).getTime();
      return {
        ...auction,
        id: auction._id?.toString() || auction.id,
        status: getAuctionStatus(startTime, endTime),
        startTime,
        endTime,
      };
    });
  } catch {
    return [];
  }
}

async function getNewsPosts() {
  try {
    const res = await fetch('http://localhost:3000/api/news', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.newsPosts || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, auctions, newsPosts] = await Promise.all([
    getProducts(),
    getAuctions(),
    getNewsPosts(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd />
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: 'https://samsbikeshop.co.za' }]} />
      <HomePageContent products={products} auctions={auctions} newsPosts={newsPosts} />
    </>
  );
}

import AuctionPageContent from './AuctionPageContent';
import { AuctionJsonLd } from '../../components/JsonLd';
import { Breadcrumbs } from '../../components/Breadcrumbs';

async function getAuction(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auctions/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const startTime = new Date(data.startTime).getTime();
    const endTime = new Date(data.endTime).getTime();
    const status = Date.now() < startTime ? 'UPCOMING' : Date.now() > endTime ? 'ENDED' : 'LIVE';
    return {
      ...data,
      id: data._id?.toString() || data.id,
      status,
      startTime,
      endTime,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuction(id);
  if (!auction) return { title: 'Auction Not Found | Sam\'s Bike Shop' };
  return {
    title: `Bid on ${auction.name} | Sam's Bike Shop Auction`,
    description: auction.description?.substring(0, 160) || `Bid on ${auction.name} at Sam's Bike Shop auction in Soweto.`,
    openGraph: {
      title: `Bid on ${auction.name} | Sam's Bike Shop`,
      description: auction.description?.substring(0, 160),
      url: `https://samsbikeshop.co.za/auctions/${id}`,
      siteName: "Sam's Bike Shop",
      type: "website",
      images: auction.image ? [{ url: auction.image, width: 800, height: 600, alt: auction.name }] : [],
    },
  };
}

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auction = await getAuction(id);

  if (!auction) {
    return <div className="text-center py-20">Auction not found.</div>;
  }

  return (
    <>
      <AuctionJsonLd auction={auction} />
      <Breadcrumbs items={[
        { label: 'Auctions', href: '/auctions' },
        { label: auction.name },
      ]} />
      <AuctionPageContent auction={auction} />
    </>
  );
}

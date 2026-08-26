import { Metadata } from 'next';
import { BreadcrumbJsonLd } from '../components/JsonLd';
import { Breadcrumbs } from '../components/Breadcrumbs';
import ShopPageContent from './ShopPageContent';

export const metadata: Metadata = {
  title: "Shop Bikes, Parts & Accessories | Sam's Bike Shop",
  description: "Browse premium bicycles, parts, and accessories at Sam's Bike Shop in Soweto, Gauteng. Shop mountain bikes, road bikes, components, and cycling gear with expert advice.",
  keywords: "buy bikes, bicycle shop, bike parts, cycling accessories, mountain bike, road bike, soweto bike shop",
  openGraph: {
    title: "Shop Bikes, Parts & Accessories | Sam's Bike Shop",
    description: "Premium bicycles, parts, and accessories in Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za/shop",
    siteName: "Sam's Bike Shop",
    type: "website",
  },
};

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.products || []
  } catch { return [] }
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://samsbikeshop.co.za" },
        { name: "Shop", url: "https://samsbikeshop.co.za/shop" }
      ]} />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" }
      ]} />
      <ShopPageContent products={products} />
    </>
  );
}

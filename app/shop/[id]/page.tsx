import ProductPageContent from './ProductPageContent';
import { ProductJsonLd } from '../../components/JsonLd';
import { Breadcrumbs } from '../../components/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found | Sam\'s Bike Shop' };
  return {
    title: `${product.name} - R${product.price} | Sam's Bike Shop`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} at Sam's Bike Shop in Soweto, Gauteng. R${product.price}.`,
    openGraph: {
      title: `${product.name} | Sam's Bike Shop`,
      description: product.description?.substring(0, 160),
      url: `https://samsbikeshop.co.za/shop/${id}`,
      siteName: "Sam's Bike Shop",
      type: "website",
      images: product.image ? [{ url: product.image, width: 800, height: 600, alt: product.name }] : [],
    },
  };
}

async function getProduct(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function getReviews(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}/reviews`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews || [];
  } catch { return []; }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, reviews] = await Promise.all([getProduct(id), getReviews(id)]);

  if (!product) {
    return <div className="flex justify-center items-center h-screen text-xl">Product not found</div>;
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: product.name }]} />
      <ProductPageContent product={product} reviews={reviews} />
    </>
  );
}

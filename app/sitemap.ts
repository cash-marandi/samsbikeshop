import { MetadataRoute } from 'next'

const BASE_URL = 'https://samsbikeshop.co.za'

async function getProducts() {
  try {
    const res = await fetch(`${BASE_URL}/api/products`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.products || []
  } catch {
    return []
  }
}

async function getAuctions() {
  try {
    const res = await fetch(`${BASE_URL}/api/auctions`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.auctions || []
  } catch {
    return []
  }
}

async function getNewsPosts() {
  try {
    const res = await fetch(`${BASE_URL}/api/news`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.newsPosts || []
  } catch {
    return []
  }
}

async function getRentalBikes() {
  try {
    const res = await fetch(`${BASE_URL}/api/rentals`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.rentalBikes || data.bikes || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/auctions`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/rentals`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/repairs`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/how-to-bid`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/request`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const [products, auctions, newsPosts, rentalBikes] = await Promise.all([
    getProducts(),
    getAuctions(),
    getNewsPosts(),
    getRentalBikes(),
  ])

  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${BASE_URL}/shop/${product._id?.toString() || product.id}`,
    lastModified: new Date(product.updatedAt || product.createdAt || now),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const auctionPages: MetadataRoute.Sitemap = auctions.map((auction: any) => ({
    url: `${BASE_URL}/auctions/${auction._id?.toString() || auction.id}`,
    lastModified: new Date(auction.updatedAt || auction.createdAt || now),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const newsPages: MetadataRoute.Sitemap = newsPosts.map((post: any) => ({
    url: `${BASE_URL}/news/${post._id?.toString() || post.id}`,
    lastModified: new Date(post.updatedAt || post.createdAt || now),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const rentalPages: MetadataRoute.Sitemap = rentalBikes.map((bike: any) => ({
    url: `${BASE_URL}/rentals`,
    lastModified: new Date(bike.updatedAt || bike.createdAt || now),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...auctionPages, ...newsPages, ...rentalPages]
}

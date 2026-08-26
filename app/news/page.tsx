import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '../components/JsonLd'
import { Breadcrumbs } from '../components/Breadcrumbs'
import NewsPageContent from './NewsPageContent'

export const metadata: Metadata = {
  title: "Cycling News & Updates | Sam's Bike Shop - Soweto",
  description: "Stay updated with the latest cycling news, gear reviews, and community events from Sam's Bike Shop in Soweto, Gauteng. Workshop updates and local racing news.",
  keywords: "cycling news, bike news, gear reviews, soweto cycling, johannesburg bike news, cycling events gauteng",
  openGraph: {
    title: "Cycling News & Updates | Sam's Bike Shop",
    description: "Latest cycling news, gear reviews, and community events in Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za/news",
    siteName: "Sam's Bike Shop",
    type: "website",
  },
}

async function getNewsPosts() {
  try {
    const res = await fetch('http://localhost:3000/api/news', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.newsPosts || []
  } catch { return [] }
}

async function getCategories() {
  try {
    const res = await fetch('http://localhost:3000/api/categories', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch { return [] }
}

export default async function NewsPage() {
  const [newsPosts, categories] = await Promise.all([getNewsPosts(), getCategories()])

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://samsbikeshop.co.za' },
          { name: 'News', url: 'https://samsbikeshop.co.za/news' },
        ]}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'News' },
        ]}
      />
      <NewsPageContent newsPosts={newsPosts} categories={categories} />
    </>
  )
}

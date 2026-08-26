import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '../../components/JsonLd'
import { Breadcrumbs } from '../../components/Breadcrumbs'
import ArticlePageContent from './ArticlePageContent'
import { notFound } from 'next/navigation'

async function getPost(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/news`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.newsPosts?.find((p: any) => (p._id || p.id) === id) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  if (!post) return { title: 'Article Not Found' }

  return {
    title: `${post.title} | Sam's Bike Shop News`,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160),
      url: `https://samsbikeshop.co.za/news/${id}`,
      siteName: "Sam's Bike Shop",
      images: post.image ? [{ url: post.image, width: 800, height: 400 }] : [],
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) notFound()

  const breadcrumbsJsonLd = [
    { name: 'Home', url: '/' },
    { name: 'News', url: '/news' },
    { name: post.title, url: `/news/${id}` },
  ]

  const breadcrumbsVisual = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: post.title, href: `/news/${id}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbsJsonLd} />
      <Breadcrumbs items={breadcrumbsVisual} />
      <ArticlePageContent post={post} />
    </>
  )
}

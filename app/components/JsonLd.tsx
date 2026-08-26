interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: "Sam's Bike Shop",
    description: 'Premium bicycles, expert repairs, bike rentals, and live auctions in Soweto, Gauteng. Serving the cycling community since 1998.',
    url: 'https://samsbikeshop.co.za',
    logo: 'https://samsbikeshop.co.za/images/logo.png',
    image: 'https://samsbikeshop.co.za/images/herobg.jpg',
    telephone: '+27-11-123-4567',
    email: 'info@samsbikeshop.co.za',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2057 Parsley Street, R558 Main Road, Silver Leaf',
      addressLocality: 'Protea Glen, Soweto',
      addressRegion: 'Gauteng',
      postalCode: '1818',
      addressCountry: 'ZA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -26.2515,
      longitude: 27.8525,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: -26.2515,
        longitude: 27.8525,
      },
      geoRadius: '50km',
    },
    sameAs: [
      'https://www.facebook.com/samsbikeshop',
      'https://www.instagram.com/samsbikeshop',
      'https://twitter.com/samsbikeshop',
    ],
    foundingDate: '1998',
    founder: {
      '@type': 'Person',
      name: 'Samuel Maswanganyi',
    },
  }

  return <JsonLd data={data} />
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Sam's Bike Shop",
    url: 'https://samsbikeshop.co.za',
    logo: 'https://samsbikeshop.co.za/images/logo.png',
    description: 'South Africa premium bicycle shop offering sales, repairs, rentals, and auctions.',
    foundingDate: '1998',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+27-11-123-4567',
      contactType: 'customer service',
      availableLanguage: ['English', 'Afrikaans', 'Zulu'],
    },
    sameAs: [
      'https://www.facebook.com/samsbikeshop',
      'https://www.instagram.com/samsbikeshop',
      'https://twitter.com/samsbikeshop',
    ],
  }

  return <JsonLd data={data} />
}

export function ProductJsonLd({ product }: { product: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product._id?.toString() || product.id,
    offers: {
      '@type': 'Offer',
      url: `https://samsbikeshop.co.za/shop/${product._id?.toString() || product.id}`,
      priceCurrency: 'ZAR',
      price: product.discount
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price,
      availability: product.isSold
        ? 'https://schema.org/SoldOut'
        : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(product.reviews && product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (
          product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          product.reviews.length
        ).toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  }

  return <JsonLd data={data} />
}

export function AuctionJsonLd({ auction }: { auction: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: auction.name,
    description: auction.description,
    image: auction.image,
    startDate: auction.startTime,
    endDate: auction.endTime,
    eventStatus: auction.status === 'LIVE' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventEnded',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: "Sam's Bike Shop",
      address: {
        '@type': 'PostalAddress',
        streetAddress: '2057 Parsley Street, R558 Main Road, Silver Leaf',
        addressLocality: 'Protea Glen, Soweto',
        addressRegion: 'Gauteng',
        addressCountry: 'ZA',
      },
    },
    offers: {
      '@type': 'Offer',
      price: auction.currentBid,
      priceCurrency: 'ZAR',
      availability: 'https://schema.org/InStock',
      url: `https://samsbikeshop.co.za/auctions/${auction._id?.toString() || auction.id}`,
    },
  }

  return <JsonLd data={data} />
}

export function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return <JsonLd data={data} />
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={data} />
}

export function HowToJsonLd({ steps, name, description }: { steps: { name: string; text: string }[]; name: string; description: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }

  return <JsonLd data={data} />
}

export function ArticleJsonLd({ article }: { article: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.content?.substring(0, 160),
    image: article.image,
    datePublished: article.createdAt,
    dateModified: article.updatedAt || article.createdAt,
    author: {
      '@type': 'Organization',
      name: "Sam's Bike Shop",
    },
    publisher: {
      '@type': 'Organization',
      name: "Sam's Bike Shop",
      logo: {
        '@type': 'ImageObject',
        url: 'https://samsbikeshop.co.za/images/logo.png',
      },
    },
  }

  return <JsonLd data={data} />
}

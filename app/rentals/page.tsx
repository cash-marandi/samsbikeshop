import { Metadata } from 'next';
import { BreadcrumbJsonLd, FAQJsonLd } from '../components/JsonLd';
import { Breadcrumbs } from '../components/Breadcrumbs';
import RentalsPageContent from './RentalsPageContent';

const rentalFaqs = [
  { question: "What's included in the rental?", answer: "Every rental includes the bicycle, helmet, lock, and a basic repair kit. Premium rentals include cycling gloves and a water bottle cage." },
  { question: "Is there insurance on rental bikes?", answer: "A minimal insurance fee is included in all rentals to cover accidental damage. Coverage details are provided at booking." },
  { question: "Can I rent for multiple days?", answer: "Yes! We offer daily, weekend, and weekly rental rates. Long-term rentals are available at discounted rates." },
  { question: "What if the bike gets damaged?", answer: "Minor wear is expected. For significant damage, your insurance cover applies. Contact us immediately and we'll arrange a replacement." },
];

export const metadata: Metadata = {
  title: "Bike Rentals in Johannesburg | Sam's Bike Shop - Premium Rentals",
  description: "Rent premium bicycles in Johannesburg and Soweto from Sam's Bike Shop. Mountain bikes, road bikes, and more. Easy online booking with EFT payment in Gauteng.",
  keywords: "bike rental, bicycle hire, rent a bike, soweto bike rental, johannesburg cycling, gauteng bike hire",
  openGraph: {
    title: "Bike Rentals in Johannesburg | Sam's Bike Shop",
    description: "Premium bicycle rentals in Johannesburg and Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za/rentals",
    siteName: "Sam's Bike Shop",
    type: "website",
  },
}

async function getRentalBikes() {
  try {
    const res = await fetch('http://localhost:3000/api/rentals', { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.rentalBikes || data.bikes || []
  } catch { return [] }
}

export default async function RentalsPage() {
  const rentalBikes = await getRentalBikes();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://samsbikeshop.co.za' },
          { name: 'Rentals', url: 'https://samsbikeshop.co.za/rentals' },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Rentals' }]} />
      <FAQJsonLd faqs={rentalFaqs} />
      <RentalsPageContent rentalBikes={rentalBikes} />
    </>
  );
}

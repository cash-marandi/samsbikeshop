import { Metadata } from 'next';
import { BreadcrumbJsonLd, FAQJsonLd } from '../components/JsonLd';
import RepairsPageContent from './RepairsPageContent';

const repairFaqs = [
  { question: "Do you offer mobile bike repairs?", answer: "Yes! Our fully-equipped mobile workshop van comes to your home or office throughout Soweto and Johannesburg. We can also pick up your bike, service it, and deliver it back." },
  { question: "How long does a bike service take?", answer: "Basic tune-ups are completed same-day. Full overhauls typically take 2-3 business days. We'll give you a timeline when you book." },
  { question: "Do you service all bike brands?", answer: "Yes, our UCI certified mechanics service all brands including Trek, Specialized, Giant, Cannondale, and more." },
  { question: "What payment methods do you accept?", answer: "We accept EFT, credit/debit cards, and cash. Payment is due upon collection or delivery." },
];

export const metadata: Metadata = {
  title: "Expert Bike Repairs & Mobile Service | Sam's Bike Shop - Soweto",
  description: "Professional bicycle repairs and maintenance at Sam's Bike Shop in Soweto, Gauteng. Mobile repair service available. From basic tune-ups to full overhauls by certified mechanics.",
  keywords: "bike repair, bicycle maintenance, mobile bike repair, bike service, soweto bike repair, cycling maintenance gauteng",
  openGraph: {
    title: "Expert Bike Repairs & Mobile Service | Sam's Bike Shop",
    description: "Professional bicycle repairs and mobile service in Soweto, Gauteng.",
    url: "https://samsbikeshop.co.za/repairs",
    siteName: "Sam's Bike Shop",
    type: "website",
  },
};

export default function RepairsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://samsbikeshop.co.za' },
        { name: 'Repairs', url: 'https://samsbikeshop.co.za/repairs' },
      ]} />
      <FAQJsonLd faqs={repairFaqs} />
      <RepairsPageContent />
    </>
  );
}

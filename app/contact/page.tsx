import { Metadata } from 'next'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { BreadcrumbJsonLd, FAQJsonLd } from '../components/JsonLd'

const contactFaqs = [
  { question: "Do I need an appointment for repairs?", answer: "Walk-ins are welcome during business hours. For guaranteed same-day service, we recommend booking online or by phone." },
  { question: "Where are you located?", answer: "We're at 2057 Parsley Street, R558 Main Road, Silver Leaf, Protea Glen, Soweto, Gauteng." },
  { question: "What are your business hours?", answer: "Monday to Friday: 8am - 7pm. Saturday: 9am - 5pm. Closed on Sundays and public holidays." },
  { question: "Do you offer delivery?", answer: "Yes, we offer bike pickup and delivery service throughout Soweto and Johannesburg. Contact us for delivery rates." },
]

export const metadata: Metadata = {
  title: 'Contact Us | Sam\'s Bike Shop - Soweto, Gauteng',
  description: 'Get in touch with Sam\'s Bike Shop in Protea Glen, Soweto. Visit us at 2057 Parsley Street or call +27 (0) 11 123 4567. Open Mon-Fri 8am-7pm, Sat 9am-5pm.',
  keywords: 'contact sams bike shop, bike shop soweto, bike shop protea glen, bicycle repair gauteng',
  openGraph: {
    title: 'Contact Us | Sam\'s Bike Shop',
    description: 'Visit us in Protea Glen, Soweto or call +27 (0) 11 123 4567.',
    url: 'https://samsbikeshop.co.za/contact',
    siteName: 'Sam\'s Bike Shop',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://samsbikeshop.co.za' },
        { name: 'Contact', url: 'https://samsbikeshop.co.za/contact' },
      ]} />
      <FAQJsonLd faqs={contactFaqs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-28">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-6xl font-bold uppercase tracking-tighter mb-8">Let&apos;s Talk <span className="text-flame-500">Gear.</span></h1>
            <p className="text-xl text-ink-700 mb-12">Have questions about a build, a rental, or an upcoming auction? Our experts are standing by.</p>
            
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-ink-200 rounded-xl flex items-center justify-center text-flame-500 flex-shrink-0 border border-ink-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-600 mb-2">Workshop Location</h4>
                  <p className="text-lg font-bold text-ink-900">2057 Parsley Street</p>
                  <p className="text-lg font-bold text-ink-900">R558 Main Road, Silver Leaf</p>
                  <p className="text-lg font-bold text-ink-900">Protea Glen, Soweto, Gauteng</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-ink-200 rounded-xl flex items-center justify-center text-flame-500 flex-shrink-0 border border-ink-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-600 mb-2">Business Hours</h4>
                  <p className="text-lg font-bold text-ink-900">Mon - Fri: 8am - 7pm</p>
                  <p className="text-lg font-bold text-ink-900">Sat: 9am - 5pm</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-ink-200 rounded-xl flex items-center justify-center text-flame-500 flex-shrink-0 border border-ink-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-ink-600 mb-2">Direct Line</h4>
                  <p className="text-lg font-bold text-flame-500">+27 (0) 11 123 4567</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-xl border border-ink-200 relative">
            <form className="space-y-6" action="/api/contact" method="POST">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-600 ml-1">Your Name</label>
                  <input type="text" name="name" className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-4 focus:outline-none focus:border-flame-500" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-ink-600 ml-1">Email Address</label>
                  <input type="email" name="email" className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-4 focus:outline-none focus:border-flame-500" placeholder="john@domain.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-600 ml-1">Appointment Date</label>
                <input type="date" name="date" className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-4 focus:outline-none focus:border-flame-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-600 ml-1">Subject</label>
                <select name="subject" className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-4 focus:outline-none focus:border-flame-500 appearance-none">
                  <option>Select an inquiry type</option>
                  <option>Bike Sales</option>
                  <option>Rental Booking</option>
                  <option>Auction Question</option>
                  <option>Service & Repair</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink-600 ml-1">Your Message</label>
                <textarea name="message" className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-4 focus:outline-none focus:border-flame-500 min-h-[200px]" placeholder="How can we help you get back on the road?" required></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-flame-500 text-white font-bold rounded-xl hover:bg-flame-600 transition-colors uppercase tracking-[0.2em]">Send Transmission</button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-24">
        <h2 className="text-3xl font-bold uppercase tracking-tighter mb-8 text-center">Frequently Asked Questions</h2>
        <div className="bg-ink-100 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="font-bold text-ink-900 mb-2">Do I need an appointment for repairs?</h3>
            <p className="text-ink-600">Walk-ins are welcome during business hours. For guaranteed same-day service, we recommend booking online or by phone.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">Where are you located?</h3>
            <p className="text-ink-600">We&apos;re at 2057 Parsley Street, R558 Main Road, Silver Leaf, Protea Glen, Soweto, Gauteng.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">What are your business hours?</h3>
            <p className="text-ink-600">Monday to Friday: 8am - 7pm. Saturday: 9am - 5pm. Closed on Sundays and public holidays.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">Do you offer delivery?</h3>
            <p className="text-ink-600">Yes, we offer bike pickup and delivery service throughout Soweto and Johannesburg. Contact us for delivery rates.</p>
          </div>
        </div>
      </div>
    </>
  )
}

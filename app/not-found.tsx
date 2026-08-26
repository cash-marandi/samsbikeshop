import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-display font-bold text-ink-200 mb-4">404</div>
        <h1 className="text-3xl font-display font-bold text-ink-900 mb-4">Page Not Found</h1>
        <p className="text-ink-500 mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-flame-500 hover:bg-flame-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-glow transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ink-900 hover:bg-ink-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  )
}

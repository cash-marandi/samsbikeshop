export default function Loading() {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-ink-200 border-t-flame-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-ink-500 font-medium">Loading auctions...</p>
      </div>
    </div>
  )
}

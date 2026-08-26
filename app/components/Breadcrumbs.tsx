import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-ink-500">
        <li>
          <Link href="/" className="hover:text-flame-600 transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <span className="text-ink-300">/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-flame-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { AddMeterForm } from '../components/AddMeterForm'

const breadcrumbs = [
  { label: 'Головна', href: '/' },
  { label: 'Лічильники', href: '/meters' },
  { label: 'Додати лічильник' },
]

export default function AddMeterPage() {
  const navigate = useNavigate()

  return (
    <AuthenticatedLayout
      pageTitle="Додати лічильник"
      pageSubtitle="Заповніть форму, щоб додати новий лічильник до обраної адреси"
    >
      <div className="space-y-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400"
        >
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <span key={breadcrumb.label} className="flex items-center gap-2">
                {breadcrumb.href && !isLast ? (
                  <Link
                    to={breadcrumb.href}
                    className="transition-colors hover:text-gray-700 dark:hover:text-slate-200"
                  >
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-gray-700 dark:text-slate-200' : undefined}>
                    {breadcrumb.label}
                  </span>
                )}
                {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
              </span>
            )
          })}
        </nav>

        <AddMeterForm onCancel={() => navigate('/addresses')} />
      </div>
    </AuthenticatedLayout>
  )
}

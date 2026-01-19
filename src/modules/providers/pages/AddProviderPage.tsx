import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { AddProviderForm } from '../components/AddProviderForm'

const breadcrumbs = [
  { label: 'Головна', href: '/' },
  { label: 'Провайдери', href: '/providers' },
  { label: 'Додати провайдера' },
]

export default function AddProviderPage() {
  const navigate = useNavigate()

  return (
    <AuthenticatedLayout
      pageTitle="Додати провайдера"
      pageSubtitle="Створіть запис про тариф комунальної послуги для швидкого доступу"
    >
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <span key={breadcrumb.label} className="flex items-center gap-2">
                {breadcrumb.href && !isLast ? (
                  <Link to={breadcrumb.href} className="transition-colors hover:text-gray-700">
                    {breadcrumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-gray-700' : undefined}>{breadcrumb.label}</span>
                )}
                {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
              </span>
            )
          })}
        </nav>

        <AddProviderForm onCancel={() => navigate('/providers')} />
      </div>
    </AuthenticatedLayout>
  )
}

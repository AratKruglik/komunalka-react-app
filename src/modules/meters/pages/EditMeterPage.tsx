import { ChevronRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { ROUTES } from '@shared/constants/routes'
import { useMeter } from '@modules/meters/hooks'
import { EditMeterForm } from '../components/EditMeterForm'

const breadcrumbs = [
  { label: 'Головна', href: '/' },
  { label: 'Лічильники', href: '/meters' },
  { label: 'Редагування лічильника' },
]

export default function EditMeterPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const meterId = id ? Number(id) : null
  const { meter, isLoading, error } = useMeter(meterId)

  return (
    <AuthenticatedLayout
      pageTitle="Редагування лічильника"
      pageSubtitle="Змініть дані лічильника та збережіть зміни"
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

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-500 dark:text-slate-400">Завантаження даних лічильника...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {meter && (
          <EditMeterForm
            meter={meter}
            onCancel={() => navigate(ROUTES.METERS)}
            onSuccess={() => navigate(ROUTES.METERS)}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}

import { ChevronRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { ROUTES } from '@shared/constants/routes'
import { useAddress } from '../hooks'
import { EditAddressForm } from '../components/EditAddressForm'

const breadcrumbs = [
  { label: 'Головна', href: '/' },
  { label: 'Мої адреси', href: '/addresses' },
  { label: 'Редагування адреси' },
]

export default function EditAddressPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addressId = id ? Number(id) : undefined
  const { address, isLoading, error } = useAddress(addressId)

  return (
    <AuthenticatedLayout
      pageTitle="Редагування адреси"
      pageSubtitle="Змініть дані адреси та збережіть зміни"
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
            <p className="text-gray-500 dark:text-slate-400">Завантаження даних адреси...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {address && (
          <EditAddressForm
            address={address}
            onCancel={() => navigate(ROUTES.ADDRESSES)}
            onSuccess={() => navigate(ROUTES.ADDRESSES)}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}

import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { ProfileForm } from '../components/ProfileForm'

const breadcrumbs = [
  { label: 'Головна', href: '/' },
  { label: 'Профіль користувача' },
]

export default function ProfilePage() {
  const navigate = useNavigate()

  return (
    <AuthenticatedLayout
      pageTitle="Профіль користувача"
      pageSubtitle="Керуйте своїми особистими даними та налаштуваннями"
    >
      <div className="space-y-6">
        {/* Breadcrumbs */}
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
                  <span
                    className={isLast ? 'font-medium text-gray-700 dark:text-slate-200' : undefined}
                  >
                    {breadcrumb.label}
                  </span>
                )}
                {!isLast ? <ChevronRight className="h-4 w-4" /> : null}
              </span>
            )
          })}
        </nav>

        {/* Profile Form */}
        <div className="mx-auto w-full max-w-5xl lg:max-w-6xl">
          <ProfileForm onCancel={() => navigate('/')} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

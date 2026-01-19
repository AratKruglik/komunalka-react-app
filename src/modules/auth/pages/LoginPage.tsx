import { Link } from 'react-router'
import { GuestLayout } from '@shared/components/layout/GuestLayout'
import { Logo } from '@shared/components/ui'
import { ROUTES } from '@shared/constants'
import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  return (
    <GuestLayout>
      <div className="w-full max-w-[448px]">
        <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-7 dark:bg-slate-900">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-slate-300">
              Управління комунальними послугами
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800">
            <button className="flex-1 border-b-2 border-text-dark px-4 py-3 text-base font-medium text-text-dark dark:border-amber-300 dark:text-amber-200">
              Вхід
            </button>
            <Link
              to={ROUTES.REGISTER}
              className="flex-1 border-b-2 border-transparent px-4 py-3 text-center text-base font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Реєстрація
            </Link>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center dark:bg-slate-800">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              © 2023 Комуналка. Всі права захищені.
            </p>
          </div>
        </div>
      </div>
    </GuestLayout>
  )
}

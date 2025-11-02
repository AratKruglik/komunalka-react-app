import { Link } from 'react-router'
import { GuestLayout } from '../../../shared/components/layout/GuestLayout'
import { Logo } from '../../../shared/components/ui'
import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  return (
    <GuestLayout>
      <div className="w-full max-w-[448px]">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-7">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <p className="text-center text-sm text-gray-600">
              Управління комунальними послугами
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button className="flex-1 px-4 py-3 text-base font-medium text-[#333333] border-b-2 border-[#333333]">
              Вхід
            </button>
            <Link
              to="/register"
              className="flex-1 px-4 py-3 text-base font-medium text-gray-400 border-b-2 border-transparent hover:text-gray-600 transition-colors text-center"
            >
              Реєстрація
            </Link>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              © 2023 Комуналка. Всі права захищені.
            </p>
          </div>
        </div>
      </div>
    </GuestLayout>
  )
}

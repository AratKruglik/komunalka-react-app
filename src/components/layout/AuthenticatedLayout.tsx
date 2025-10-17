import { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Logo } from '../common/Logo'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-[#333333] font-medium transition-colors [&.active]:text-[#333333] [&.active]:font-semibold"
              >
                Головна
              </Link>
              <Link
                to="/addresses"
                className="text-gray-700 hover:text-[#333333] font-medium transition-colors [&.active]:text-[#333333] [&.active]:font-semibold"
              >
                Адреси
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Профіль</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AuthenticatedSidebar,
  type SidebarSection,
} from '../navigation/AuthenticatedSidebar'
import {
  AuthenticatedTopbar,
  type TopbarUser,
} from '../navigation/AuthenticatedTopbar'

interface AuthenticatedLayoutProps {
  children: ReactNode
  pageTitle?: string
  pageSubtitle?: string
  notificationsCount?: number
  sidebarSections?: SidebarSection[]
  user?: TopbarUser
}

const defaultUser: TopbarUser = {
  name: 'Олена Петренко',
  email: 'olena@example.com',
}

export function AuthenticatedLayout({
  children,
  pageTitle = 'Мої адреси',
  pageSubtitle,
  notificationsCount = 0,
  sidebarSections,
  user = defaultUser,
}: AuthenticatedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSidebarToggle = () => {
    setIsSidebarOpen((previous) => !previous)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    if (!isSidebarOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isSidebarOpen])

  return (
    <>
      <div className="flex min-h-screen overflow-x-hidden bg-[#F5F6FA] text-[#333333]">
        {/* Desktop Sidebar - Hidden on mobile/tablet, visible from lg (1024px) */}
        <AuthenticatedSidebar sections={sidebarSections} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AuthenticatedTopbar
            title={pageTitle}
            subtitle={pageSubtitle}
            notificationsCount={notificationsCount}
            user={user}
            onMenuToggle={handleSidebarToggle}
            isSidebarOpen={isSidebarOpen}
          />

          <main className="flex-1 overflow-y-auto">
            {/* Responsive padding: mobile (12px), tablet (24px), desktop (24px) */}
            <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-6 sm:py-5 lg:py-6">
              {children}
            </div>
          </main>

          {/* Responsive Footer */}
          <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3 px-3 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
              <p className="text-xs sm:text-sm">© 2024 Комуналка. Всі права захищені.</p>
              <div className="flex flex-wrap gap-3 text-xs sm:gap-4 sm:text-sm">
                <a href="#" className="transition-colors hover:text-[#333333]">
                  Умови використання
                </a>
                <a href="#" className="transition-colors hover:text-[#333333]">
                  Політика конфіденційності
                </a>
                <a href="#" className="transition-colors hover:text-[#333333]">
                  Контакти
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile/Tablet Sidebar Overlay - Only visible when menu is open and screen < lg */}
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
            onClick={handleCloseSidebar}
          />
          <div className="relative mr-auto flex h-full w-full max-w-[20rem] flex-1 sm:max-w-xs">
            <AuthenticatedSidebar
              sections={sidebarSections}
              variant="mobile"
              user={user}
              onClose={handleCloseSidebar}
              onNavigate={handleCloseSidebar}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}

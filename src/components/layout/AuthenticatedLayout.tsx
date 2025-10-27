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
  return (
    <div className="flex min-h-screen bg-[#F5F6FA] text-[#333333]">
      <AuthenticatedSidebar sections={sidebarSections} />

      <div className="flex flex-1 flex-col">
        <AuthenticatedTopbar
          title={pageTitle}
          subtitle={pageSubtitle}
          notificationsCount={notificationsCount}
          user={user}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1184px] px-4 py-6">{children}</div>
        </main>

        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-[1184px] flex-col gap-2 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2024 Комуналка. Всі права захищені.</p>
            <div className="flex flex-wrap gap-4">
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
  )
}

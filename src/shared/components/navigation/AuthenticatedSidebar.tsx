import { NavLink } from 'react-router'
import {
  BarChart3,
  CreditCard,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Plug,
  Settings,
  User,
  X,
} from 'lucide-react'
import { Logo } from '../ui'
import type { LucideIcon } from 'lucide-react'

export interface SidebarItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
  badgeTone?: 'info' | 'primary'
  exact?: boolean
}

export interface SidebarSection {
  heading: string
  items: SidebarItem[]
}

export interface SidebarUser {
  name: string
  email: string
  avatarUrl?: string
}

interface AuthenticatedSidebarProps {
  sections?: SidebarSection[]
  variant?: 'desktop' | 'mobile'
  user?: SidebarUser
  onClose?: () => void
  onNavigate?: () => void
}

const defaultSections: SidebarSection[] = [
  {
    heading: 'Головне меню',
    items: [
      {
        label: 'Дашборд',
        to: '/',
        icon: LayoutDashboard,
        exact: true,
      },
      {
        label: 'Мої адреси',
        to: '/addresses',
        icon: MapPin,
      },
      {
        label: 'Лічильники',
        to: '/meters',
        icon: Gauge,
      },
      {
        label: 'Провайдери',
        to: '/providers',
        icon: Plug,
      },
      {
        label: 'Мої рахунки',
        to: '/accounts',
        icon: FileText,
      },
      {
        label: 'Аналітика',
        to: '/analytics',
        icon: BarChart3,
      },
      {
        label: 'Платежі',
        to: '/payments',
        icon: CreditCard,
      },
    ],
  },
  {
    heading: 'Налаштування',
    items: [
      {
        label: 'Налаштування',
        to: '/settings',
        icon: Settings,
      },
      {
        label: 'Допомога',
        to: '/help',
        icon: HelpCircle,
      },
    ],
  },
]

export function AuthenticatedSidebar({
  sections = defaultSections,
  variant = 'desktop',
  user,
  onClose,
  onNavigate,
}: AuthenticatedSidebarProps) {
  const isMobile = variant === 'mobile'

  const containerClasses = isMobile
    ? 'flex h-full w-full'
    : 'relative hidden w-64 shrink-0 lg:flex'

  const innerClasses = `flex h-full w-full flex-col border-r border-gray-200 bg-white ${
    isMobile ? 'shadow-2xl' : 'sticky top-0 min-h-full'
  }`

  return (
    <aside className={containerClasses}>
      <div className={innerClasses}>
        {/* Header with Logo - Responsive height */}
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-3 sm:h-16 sm:px-4 lg:h-[65px]">
          <Logo size="md" />
          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#333333] active:bg-gray-100 sm:h-9 sm:w-9"
              aria-label="Закрити меню"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          ) : null}
        </div>

        {/* Navigation - Scrollable with responsive padding */}
        <nav
          className={`flex-1 space-y-5 overflow-y-auto py-4 sm:space-y-6 sm:py-6 ${
            isMobile ? 'px-2' : 'px-0'
          }`}
        >
          {sections.map((section) => (
            <div key={section.heading} className="space-y-2 sm:space-y-3">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:px-4 sm:text-xs">
                {section.heading}
              </p>

              <div className="space-y-0.5 sm:space-y-1">
                {section.items.map((item) => (
                  <SidebarNavLink
                    key={item.label}
                    item={item}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section - Only visible on mobile (< 768px) */}
        {user && isMobile ? (
          <MobileUserSection user={user} onNavigate={onNavigate} />
        ) : null}
      </div>
    </aside>
  )
}

function SidebarNavLink({
  item,
  onNavigate,
}: {
  item: SidebarItem
  onNavigate?: () => void
}) {
  const Icon = item.icon

  return (
    <NavLink to={item.to} end={item.exact} className="block" onClick={onNavigate}>
      {({ isActive }) => (
        <div
          className={`flex h-10 items-center gap-2.5 px-3 text-sm transition-colors sm:h-11 sm:gap-3 sm:px-4 sm:text-base lg:h-12 ${
            isActive
              ? 'bg-[#FFF0A0] font-medium text-[#333333]'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#333333] active:bg-gray-200'
          }`}
        >
          <Icon className="h-4 w-4 flex-shrink-0 sm:h-[18px] sm:w-[18px]" />
          <span className="min-w-0 flex-1 truncate leading-5 sm:leading-6">{item.label}</span>
          {item.badge ? (
            <span
              className={`ml-auto inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-xs ${
                item.badgeTone === 'info'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-[#FFF0A0] text-[#333333]'
              }`}
            >
              {item.badge}
            </span>
          ) : null}
        </div>
      )}
    </NavLink>
  )
}

function MobileUserSection({
  user,
  onNavigate,
}: {
  user: SidebarUser
  onNavigate?: () => void
}) {
  const userMenuItems = [
    { icon: User, label: 'Мій профіль', to: '/profile' },
    { icon: Settings, label: 'Налаштування', to: '/settings' },
    { icon: LogOut, label: 'Вийти', to: '/logout', tone: 'danger' as const },
  ]

  return (
    <div className="border-t border-gray-200 bg-gray-50 md:hidden">
      {/* User Info Section */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-3 sm:px-4 sm:py-4">
        {/* Avatar or initials */}
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-gray-200 text-sm font-semibold text-[#333333] sm:h-11 sm:w-11">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
            />
          ) : (
            getInitials(user.name)
          )}
        </div>

        {/* User details */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#333333] sm:text-base">
            {user.name}
          </p>
          <p className="truncate text-xs text-gray-500 sm:text-sm">{user.email}</p>
        </div>
      </div>

      {/* User Menu Items */}
      <nav className="px-2 py-2">
        {userMenuItems.map((item) => {
          const Icon = item.icon
          const isDanger = item.tone === 'danger'

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="block"
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <div
                  className={`flex h-10 items-center gap-2.5 px-3 text-sm transition-colors sm:h-11 sm:gap-3 sm:px-4 sm:text-base ${
                    isActive && !isDanger
                      ? 'bg-[#FFF0A0] font-medium text-[#333333]'
                      : isDanger
                        ? 'text-[#D92D20] hover:bg-red-50 active:bg-red-100'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#333333] active:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 sm:h-[18px] sm:w-[18px]" />
                  <span className="min-w-0 flex-1 truncate leading-5 sm:leading-6">
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

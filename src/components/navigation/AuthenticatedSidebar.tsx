import { Link } from '@tanstack/react-router'
import {
  BarChart3,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Settings,
} from 'lucide-react'
import { Logo } from '../common/Logo'
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

interface AuthenticatedSidebarProps {
  sections?: SidebarSection[]
}

const defaultSections: SidebarSection[] = [
  {
    heading: 'Головне меню',
    items: [
      {
        label: 'Головна панель',
        to: '/',
        icon: LayoutDashboard,
        exact: true,
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
        label: 'Мої адреси',
        to: '/addresses',
        icon: MapPin,
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
}: AuthenticatedSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-[65px] items-center gap-3 border-b border-gray-200 px-4">
        <Logo size="md" />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-0 py-6">
        {sections.map((section) => (
          <div key={section.heading} className="space-y-3">
            <p className="px-4 text-xs font-semibold text-gray-400">
              {section.heading}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavLink key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function SidebarNavLink({ item }: { item: SidebarItem }) {
  const Icon = item.icon

  return (
    <Link to={item.to} activeOptions={{ exact: item.exact }} preload="intent" className="block">
      {({ isActive }) => (
        <div
          className={`flex h-12 items-center gap-3 px-4 text-base transition-colors ${
            isActive
              ? 'bg-[#FFF0A0] font-medium text-[#333333]'
              : 'text-gray-600 hover:bg-gray-100 hover:text-[#333333]'
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate leading-6">{item.label}</span>
          {item.badge ? (
            <span
              className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
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
    </Link>
  )
}

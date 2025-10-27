import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown } from 'lucide-react'

export interface TopbarUser {
  name: string
  email: string
  avatarUrl?: string
}

interface AuthenticatedTopbarProps {
  title: string
  subtitle?: string
  notificationsCount?: number
  user: TopbarUser
}

export function AuthenticatedTopbar({
  title,
  subtitle,
  notificationsCount = 0,
  user,
}: AuthenticatedTopbarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex h-[60px] w-full items-center gap-6 px-6">
        <div className="flex flex-col leading-tight">
          <h1 className="text-[20px] font-semibold text-[#333333]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[14px] font-medium text-gray-500">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center text-gray-500 transition-colors hover:text-[#333333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700]"
            aria-label="Повідомлення"
          >
            <Bell className="h-5 w-5" strokeWidth={1.6} />
            {notificationsCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#FF4D4F] px-1 text-[10px] font-semibold leading-none text-white">
                {notificationsCount}
              </span>
            ) : null}
          </button>

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}

function UserMenu({ user }: { user: TopbarUser }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node | null)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const menuItems: Array<{ id: string; label: string; tone?: 'danger' }> = [
    { id: 'profile', label: 'Мій профіль' },
    { id: 'settings', label: 'Налаштування' },
    { id: 'logout', label: 'Вийти', tone: 'danger' },
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-3 rounded-full bg-white px-3 py-1.5 text-left shadow-sm transition-colors hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFD700]"
      >
        <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-[#333333]">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            getInitials(user.name)
          )}
        </span>
        <span className="flex max-w-[140px] flex-col">
          <span className="truncate text-sm font-medium text-[#333333]">
            {user.name}
          </span>
          <span className="truncate text-xs text-gray-500">{user.email}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? '-scale-y-100' : ''
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Меню користувача"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.28)]"
        >
          <ul className="flex flex-col py-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none ${
                    item.tone === 'danger'
                      ? 'text-[#D92D20] hover:bg-red-50 focus-visible:bg-red-50'
                      : 'text-[#333333] hover:bg-gray-100 focus-visible:bg-gray-100'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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

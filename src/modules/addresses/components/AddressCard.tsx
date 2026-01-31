import { useRef, useState, useEffect } from 'react'
import {
  EllipsisVertical,
  Gauge,
  Pencil,
  Star,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import {
  getServiceIcon,
  getServiceTagClasses,
} from '@shared/constants/services'
import { Button } from '@shared/components/ui'
import { tv } from 'tailwind-variants'

export type AddressBadgeVariant = 'primary' | 'muted' | 'outline'

export interface AddressBadge {
  label: string
  variant: AddressBadgeVariant
  icon?: LucideIcon
}

interface AddressCardProps {
  id: number
  title: string
  subtitle: string
  badges: readonly AddressBadge[]
  services: readonly AddressServiceTag[]
  isPrimary?: boolean
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onSetPrimary?: (id: number) => void
}

export interface AddressServiceTag {
  type: import('../../../shared/constants/meterTypes').MeterType
  label: string
  icon?: LucideIcon
}

const dropdownStyles = tv({
  slots: {
    menu: [
      'absolute z-50 min-w-[180px] rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg',
      'dark:border-slate-800 dark:bg-slate-900',
      'right-0 top-full mt-1.5',
    ],
    item: [
      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium',
      'transition-colors focus-visible:outline-none',
    ],
  },
  variants: {
    itemTone: {
      default: {
        item: [
          'text-gray-700 hover:bg-gray-100 focus-visible:bg-gray-100',
          'dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:bg-slate-800',
        ],
      },
      danger: {
        item: [
          'text-red-600 hover:bg-red-50 focus-visible:bg-red-50',
          'dark:text-red-400 dark:hover:bg-red-950/40 dark:focus-visible:bg-red-950/40',
        ],
      },
    },
  },
  defaultVariants: {
    itemTone: 'default',
  },
})

export function AddressCard({
  id,
  title,
  subtitle,
  badges,
  services,
  isPrimary = false,
  onEdit,
  onDelete,
  onSetPrimary,
}: AddressCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const styles = dropdownStyles()

  useEffect(() => {
    if (!isMenuOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const handleSetPrimary = () => {
    setIsMenuOpen(false)
    onSetPrimary?.(id)
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete?.(id)
  }

  const surfaceClasses = isPrimary
    ? 'border-2 border-primary bg-primary-bg dark:border-amber-300 dark:bg-amber-200/10'
    : 'border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'

  return (
    <article
      className={`relative flex h-full flex-col gap-4 rounded-lg ${surfaceClasses} p-4 transition-shadow hover:shadow-md sm:gap-5 sm:p-5 lg:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pr-20 sm:pr-24">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} badge={badge} isPrimary={isPrimary} />
          ))}
        </div>

        <div className="absolute right-4 top-4 flex items-center gap-1.5 sm:right-5 sm:top-5 lg:right-6">
          <Button
            type="button"
            aria-label="Редагувати адресу"
            variant="outline"
            tone="neutral"
            size="icon"
            className="h-8 w-8 text-gray-600 dark:text-slate-200 sm:h-9 sm:w-9"
            onClick={() => onEdit?.(id)}
          >
            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          <div className="relative" ref={menuRef}>
            <Button
              type="button"
              aria-label="Інші дії"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              variant="outline"
              tone="neutral"
              size="icon"
              className="h-8 w-8 text-gray-600 dark:text-slate-200 sm:h-9 sm:w-9"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <EllipsisVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {isMenuOpen && (
              <div role="menu" aria-label="Меню дій" className={styles.menu()}>
                <ul className="flex flex-col">
                  {!isPrimary && (
                    <li>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.item()}
                        onClick={handleSetPrimary}
                      >
                        <Star className="h-4 w-4" />
                        Зробити основною
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className={dropdownStyles({ itemTone: 'danger' }).item()}
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      Видалити адресу
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-1.5">
        <h3 className="text-base font-bold leading-6 text-text-dark dark:text-slate-100 sm:text-lg sm:leading-7 lg:text-[18px]">
          {title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-slate-400 sm:text-sm">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {services.map((service) => {
          const Icon = service.icon || getServiceIcon(service.type)
          return (
            <span
              key={service.label}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:gap-2 sm:px-3 sm:py-1 sm:text-xs ${getServiceTagClasses(service.type)}`}
            >
              {Icon && <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              {service.label}
            </span>
          )
        })}
      </div>
    </article>
  )
}


function Badge({
  badge,
  isPrimary,
}: {
  badge: AddressBadge
  isPrimary: boolean
}) {
  const Icon = badge.icon ?? (badge.variant === 'muted' ? Gauge : undefined)

  const variantClasses: Record<AddressBadgeVariant, string> = {
    primary: 'bg-primary text-text-dark dark:bg-amber-300 dark:text-slate-900',
    muted: isPrimary
      ? 'bg-white/80 text-text-dark dark:bg-amber-50 dark:text-slate-900'
      : 'border border-gray-200 bg-white text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
    outline:
      'border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  }

  const Element = badge.variant === 'outline' ? 'button' : 'span'

  return (
    <Element
      type={badge.variant === 'outline' ? 'button' : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[badge.variant]}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {badge.label}
    </Element>
  )
}

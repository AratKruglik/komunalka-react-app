import { useNavigate } from 'react-router'
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
import { Button, DropdownMenu, type DropdownMenuItem } from '@shared/components/ui'
import { addressesEditPath } from '@shared/constants/routes'

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
  onDelete?: (id: number) => void
  onSetPrimary?: (id: number) => void
}

export interface AddressServiceTag {
  type: import('../../../shared/constants/meterTypes').MeterType
  label: string
  icon?: LucideIcon
}

export function AddressCard({
  id,
  title,
  subtitle,
  badges,
  services,
  isPrimary = false,
  onDelete,
  onSetPrimary,
}: AddressCardProps) {
  const navigate = useNavigate()

  const actions: DropdownMenuItem[] = [
    { id: 'edit', label: 'Редагувати', icon: <Pencil className="h-4 w-4" /> },
    ...(!isPrimary
      ? [{ id: 'setPrimary', label: 'Зробити основною', icon: <Star className="h-4 w-4" /> }]
      : []),
    { id: 'delete', label: 'Видалити адресу', icon: <Trash2 className="h-4 w-4" />, tone: 'danger' as const },
  ]

  const handleMenuSelect = (item: DropdownMenuItem) => {
    if (item.id === 'edit') navigate(addressesEditPath(id))
    else if (item.id === 'setPrimary') onSetPrimary?.(id)
    else if (item.id === 'delete') onDelete?.(id)
  }

  const surfaceClasses = isPrimary
    ? 'border-2 border-primary bg-primary-bg dark:border-amber-300 dark:bg-amber-200/10'
    : 'border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900'

  return (
    <article
      className={`relative flex h-full flex-col gap-4 rounded-lg ${surfaceClasses} p-4 transition-shadow hover:shadow-md sm:gap-5 sm:p-5 lg:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 pr-12 sm:pr-14">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} badge={badge} isPrimary={isPrimary} />
          ))}
        </div>

        <div className="absolute right-4 top-4 sm:right-5 sm:top-5 lg:right-6">
          <DropdownMenu
            trigger={
              <Button
                type="button"
                size="icon"
                variant="outline"
                tone="neutral"
                className="h-8 w-8 text-gray-600 dark:text-slate-200 sm:h-9 sm:w-9"
                aria-label={`Дії для ${title}`}
              >
                <EllipsisVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            }
            items={actions}
            onSelect={handleMenuSelect}
          />
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

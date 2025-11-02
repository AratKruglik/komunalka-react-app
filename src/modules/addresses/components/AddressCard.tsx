import {
  EllipsisVertical,
  Gauge,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import {
  getServiceIcon,
  getServiceTagClasses,
} from '../../../shared/constants/services'
import { Button } from '../../../shared/components/ui'

export type AddressBadgeVariant = 'primary' | 'muted' | 'outline'

export interface AddressBadge {
  label: string
  variant: AddressBadgeVariant
  icon?: LucideIcon
}

interface AddressAction {
  icon: LucideIcon
  label: string
}

interface AddressCardProps {
  title: string
  subtitle: string
  badges: AddressBadge[]
  services: AddressServiceTag[]
  isPrimary?: boolean
  actions?: AddressAction[]
}

export interface AddressServiceTag {
  label: string
  icon?: LucideIcon
}

const defaultActions: AddressAction[] = [
  { icon: Pencil, label: 'Редагувати адресу' },
  { icon: EllipsisVertical, label: 'Інші дії' },
]

export function AddressCard({
  title,
  subtitle,
  badges,
  services,
  isPrimary = false,
  actions = defaultActions,
}: AddressCardProps) {
  const surfaceClasses = isPrimary
    ? 'border-2 border-primary bg-primary-bg'
    : 'border border-gray-200 bg-white'

  return (
    <article
      className={`flex flex-col gap-5 rounded-lg ${surfaceClasses} p-6 transition-shadow`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} badge={badge} isPrimary={isPrimary} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(actions.length ? actions : defaultActions).map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                type="button"
                aria-label={action.label}
                variant="outline"
                tone="neutral"
                size="icon"
                className="text-gray-600"
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-[18px] font-bold leading-7 text-text-dark">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {services.map((service) => {
          const Icon = service.icon || getServiceIcon(service.label)
          return (
            <span
              key={service.label}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getServiceTagClasses(service.label)}`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
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
    primary: 'bg-primary text-text-dark',
    muted: isPrimary
      ? 'bg-white/80 text-text-dark'
      : 'border border-gray-200 bg-white text-gray-600',
    outline:
      'border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer',
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

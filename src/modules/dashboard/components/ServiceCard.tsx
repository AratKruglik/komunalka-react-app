import { TrendingDown, TrendingUp } from 'lucide-react'
import type { ServiceData } from '../types'

interface ServiceCardProps {
  service: ServiceData
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon
  const isIncrease = service.change > 0
  const isDecrease = service.change < 0
  const ChangeIcon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : null

  const formatCost = (cost: number) => {
    return cost.toLocaleString('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatRate = (rate: number) => {
    return rate.toLocaleString('uk-UA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const changeBadgeClasses = (() => {
    if (isIncrease) return 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-100'
    if (isDecrease) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-100'
    return 'bg-neutral-100 text-neutral-600 dark:bg-slate-800 dark:text-slate-200'
  })()

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-3.5 shadow-lg transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:gap-5 sm:p-4 lg:p-5">
      {/* Header: Icon + Name + Change badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <div
            className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full sm:h-10 sm:w-10 ${service.iconBg}`}
          >
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${service.iconColor}`} />
          </div>
          <h3 className="min-w-0 truncate text-sm font-semibold leading-5 text-neutral-800 dark:text-slate-100 sm:text-base">
            {service.name}
          </h3>
        </div>

        {/* Change badge - responsive size */}
        <div
          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs ${changeBadgeClasses}`}
        >
          {ChangeIcon ? (
            <ChangeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.5} />
          ) : null}
          <span>{service.change > 0 ? `+${service.change}` : service.change}%</span>
        </div>
      </div>

      {/* Cost - larger on bigger screens */}
      <p className="text-lg font-semibold leading-6 text-neutral-900 dark:text-slate-50 sm:text-xl sm:leading-7 lg:text-2xl lg:leading-8">
        ₴{formatCost(service.cost)}
      </p>

      {/* Details - consumption and rate */}
      <p className="text-xs font-medium text-neutral-500 dark:text-slate-400 sm:text-sm">
        {service.consumption} {service.unit} · ₴{formatRate(service.rate)}/{service.unit}
      </p>
    </article>
  )
}

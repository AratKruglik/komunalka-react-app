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
    if (isIncrease) return 'bg-rose-100 text-rose-600'
    if (isDecrease) return 'bg-emerald-100 text-emerald-600'
    return 'bg-neutral-100 text-neutral-600'
  })()

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-full ${service.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${service.iconColor}`} />
          </div>
          <h3 className="text-sm font-semibold leading-5 text-neutral-800">
            {service.name}
          </h3>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${changeBadgeClasses}`}
        >
          {ChangeIcon ? (
            <ChangeIcon className="h-3 w-3" strokeWidth={2.5} />
          ) : null}
          <span>{service.change > 0 ? `+${service.change}` : service.change}%</span>
        </div>
      </div>

      <p className="text-2xl font-semibold leading-8 text-neutral-900">
        ₴{formatCost(service.cost)}
      </p>

      <p className="text-xs font-medium text-neutral-500">
        {service.consumption} {service.unit} · ₴{formatRate(service.rate)}/{service.unit}
      </p>
    </article>
  )
}

import { type MeterType, METER_TYPE_OPTIONS } from '../../../shared/constants/meterTypes'

export interface MeterTypeTab {
  value: MeterType
  label: string
  count: number
  description?: string
}

interface MeterTypeTabsProps {
  tabs: MeterTypeTab[]
  activeValue: MeterType
  onChange: (value: MeterType) => void
}

export function MeterTypeTabs({ tabs, activeValue, onChange }: MeterTypeTabsProps) {
  const meterOptionsLookup = Object.fromEntries(
    METER_TYPE_OPTIONS.map((option) => [option.value, option]),
  ) as Record<MeterType, (typeof METER_TYPE_OPTIONS)[number]>

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:rounded-lg sm:border sm:border-gray-200 sm:p-3 sm:shadow-sm">
      <div className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap">
        {tabs.map((tab) => {
          const Icon = meterOptionsLookup[tab.value]?.icon
          const isActive = tab.value === activeValue

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={[
                'flex min-w-[220px] flex-1 items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all sm:min-w-[240px]',
                isActive
                  ? 'border-primary bg-primary/5 text-gray-900 shadow-sm ring-2 ring-primary/20'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50 hover:bg-primary/5',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {Icon ? (
                <span
                  className={[
                    'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl',
                    isActive ? 'bg-primary/10' : 'bg-gray-100',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <Icon className={['h-5 w-5', isActive ? 'text-primary' : 'text-gray-600'].join(' ')} />
                </span>
              ) : null}
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-semibold uppercase text-gray-500">
                  {tab.count} {tab.count === 1 ? 'ліч.' : 'лічильники'}
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {tab.label}
                </span>
                {tab.description ? (
                  <span className="text-sm text-gray-500">{tab.description}</span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

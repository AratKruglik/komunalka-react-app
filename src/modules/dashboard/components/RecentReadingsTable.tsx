import { Button } from '../../../shared/components/ui'
import type { Reading } from '../types'

interface RecentReadingsTableProps {
  readings: Reading[]
}

export function RecentReadingsTable({ readings }: RecentReadingsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-lg sm:p-5 lg:p-6">
      {/* Header with responsive layout */}
      <header className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold leading-6 text-neutral-900 sm:text-lg sm:leading-7 lg:text-xl">
          Останні показання
        </h2>
        <Button type="button" variant="link" tone="primary" className="self-start text-sm sm:text-base">
          Переглянути всі
        </Button>
      </header>

      {/* Mobile: Card-based layout */}
      <div className="space-y-3 md:hidden">
        {readings.map((reading) => {
          const Icon = reading.serviceIcon
          const differenceColor =
            reading.difference > 0
              ? 'text-emerald-600'
              : reading.difference < 0
                ? 'text-rose-600'
                : 'text-neutral-500'
          const differenceLabel =
            reading.difference > 0
              ? 'Збільшення'
              : reading.difference < 0
                ? 'Зменшення'
                : 'Без змін'

          return (
            <div
              key={reading.id}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-3.5"
            >
              {/* Service name and icon */}
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${reading.serviceIconBg}`}
                >
                  <Icon className={`h-4 w-4 ${reading.serviceIconColor}`} />
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold leading-5 text-neutral-800">
                    {reading.serviceName}
                  </h3>
                  <p className="mt-0.5 text-xs leading-4 text-neutral-500">
                    {formatDate(reading.date)}
                  </p>
                </div>
              </div>

              {/* Reading details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                    Показання
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-neutral-800">
                    {reading.value} {reading.unit}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                    {differenceLabel}
                  </p>
                  <p className={`mt-1 text-sm font-semibold leading-5 ${differenceColor}`}>
                    {reading.difference > 0 ? '+' : ''}
                    {reading.difference} {reading.unit}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tablet/Desktop: Table layout */}
      <div className="hidden md:block">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="pb-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                Послуга
              </th>
              <th className="pb-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                Дата
              </th>
              <th className="pb-3 pr-4 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                Показання
              </th>
              <th className="pb-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-500">
                Різниця
              </th>
            </tr>
          </thead>
          <tbody>
            {readings.map((reading, index) => {
              const Icon = reading.serviceIcon
              const differenceColor =
                reading.difference > 0
                  ? 'text-emerald-600'
                  : reading.difference < 0
                    ? 'text-rose-600'
                    : 'text-neutral-500'
              return (
                <tr
                  key={reading.id}
                  className={`transition-colors hover:bg-neutral-50 ${
                    index !== readings.length - 1 ? 'border-b border-neutral-200' : ''
                  }`}
                >
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full ${reading.serviceIconBg}`}
                      >
                        <Icon className={`h-4 w-4 ${reading.serviceIconColor}`} />
                      </span>
                      <span className="text-sm font-semibold leading-5 text-neutral-800">
                        {reading.serviceName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-sm leading-5 text-neutral-700">
                    {formatDate(reading.date)}
                  </td>
                  <td className="py-4 pr-4 text-sm leading-5 text-neutral-700">
                    {reading.value} {reading.unit}
                  </td>
                  <td className={`py-4 text-sm font-semibold leading-5 ${differenceColor}`}>
                    {reading.difference > 0 ? '+' : ''}
                    {reading.difference} {reading.unit}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

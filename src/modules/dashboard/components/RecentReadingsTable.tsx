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
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold leading-7 text-neutral-900">
          Останні показання
        </h2>
        <Button type="button" variant="link" tone="primary">
          Переглянути всі
        </Button>
      </header>

      <div className="overflow-x-auto">
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

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ChartDataPoint, PeriodFilter } from '../types'

interface ConsumptionChartProps {
  data: ChartDataPoint[]
}

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: '1year', label: 'За рік' },
  { value: '6months', label: 'За 6 місяців' },
  { value: '3months', label: 'За 3 місяці' },
]

export function ConsumptionChart({ data }: ConsumptionChartProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodFilter>('1year')

  // Filter data based on selected period
  const filteredData = (() => {
    switch (selectedPeriod) {
      case '3months':
        return data.slice(-3)
      case '6months':
        return data.slice(-6)
      case '1year':
        return data.slice(-12)
      default:
        return data
    }
  })()

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold leading-7 text-neutral-900">
          Графік споживання
        </h2>

        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              type="button"
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selectedPeriod === option.value
                  ? 'bg-primary text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value} ₴`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="electricity"
            name="Електроенергія"
            stroke="#FCD34D"
            strokeWidth={2}
            dot={{ fill: '#FCD34D', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="gas"
            name="Газ"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={{ fill: '#60A5FA', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="hotWater"
            name="Гаряча вода"
            stroke="#F87171"
            strokeWidth={2}
            dot={{ fill: '#F87171', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="coldWater"
            name="Холодна вода"
            stroke="#22D3EE"
            strokeWidth={2}
            dot={{ fill: '#22D3EE', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="heating"
            name="Опалення"
            stroke="#FB923C"
            strokeWidth={2}
            dot={{ fill: '#FB923C', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

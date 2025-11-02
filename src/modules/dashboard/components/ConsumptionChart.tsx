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
import { Button } from '../../../shared/components/ui'
import { SERVICE_CONFIG } from '../../../shared/constants/services'

interface ConsumptionChartProps {
  data: ChartDataPoint[]
}

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: '1year', label: 'За рік' },
  { value: '6months', label: 'За 6 місяців' },
  { value: '3months', label: 'За 3 місяці' },
]

const chartColors = {
  electricity: SERVICE_CONFIG['Електроенергія'].chartColor,
  gas: SERVICE_CONFIG['Газ'].chartColor,
  hotWater: SERVICE_CONFIG['Гаряча вода'].chartColor,
  coldWater: SERVICE_CONFIG['Холодна вода'].chartColor,
  heating: SERVICE_CONFIG['Опалення'].chartColor,
}

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
          {periodOptions.map((option) => {
            const isSelected = selectedPeriod === option.value
            return (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={isSelected ? 'solid' : 'outline'}
                tone={isSelected ? 'primary' : 'neutral'}
                className="px-4"
                onClick={() => setSelectedPeriod(option.value)}
              >
                {option.label}
              </Button>
            )
          })}
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
            stroke={chartColors.electricity}
            strokeWidth={3}
            dot={{ fill: chartColors.electricity, stroke: chartColors.electricity, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="gas"
            name="Газ"
            stroke={chartColors.gas}
            strokeWidth={3}
            dot={{ fill: chartColors.gas, stroke: chartColors.gas, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="hotWater"
            name="Гаряча вода"
            stroke={chartColors.hotWater}
            strokeWidth={3}
            dot={{ fill: chartColors.hotWater, stroke: chartColors.hotWater, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="coldWater"
            name="Холодна вода"
            stroke={chartColors.coldWater}
            strokeWidth={3}
            dot={{ fill: chartColors.coldWater, stroke: chartColors.coldWater, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="heating"
            name="Опалення"
            stroke={chartColors.heating}
            strokeWidth={3}
            dot={{ fill: chartColors.heating, stroke: chartColors.heating, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

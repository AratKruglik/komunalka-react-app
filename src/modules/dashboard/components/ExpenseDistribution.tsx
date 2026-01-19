import { useMemo, useState } from 'react'
import type { PieLabelRenderProps } from 'recharts'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from 'recharts'
import { Button } from '@shared/components/ui'
import type {
  ExpenseDistributionByPeriod,
  ExpenseDistributionItem,
  PeriodFilter,
} from '../types'

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: '1year', label: 'За рік' },
  { value: '6months', label: 'За 6 місяців' },
  { value: '3months', label: 'За 3 місяці' },
]

interface ExpenseDistributionProps {
  dataByPeriod: ExpenseDistributionByPeriod
}

export function ExpenseDistribution({ dataByPeriod }: ExpenseDistributionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('1year')

  const currentData = useMemo<ExpenseDistributionItem[]>(() => {
    return [...(dataByPeriod[selectedPeriod] ?? [])]
  }, [dataByPeriod, selectedPeriod])

  const totalExpenses = useMemo(() => {
    return currentData.reduce((sum, item) => sum + item.value, 0)
  }, [currentData])
  const formatCurrency = (value: number) => {
    const numericValue = Number.isFinite(value) ? value : 0
    return `₴${numericValue.toLocaleString('uk-UA')}`
  }

  const renderLabel = (props: PieLabelRenderProps) => {
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      name,
    } = props

    const percentValue =
      typeof percent === 'number' ? percent : Number(percent ?? 0)
    const startRadius =
      typeof innerRadius === 'number'
        ? innerRadius
        : Number(innerRadius ?? 0)
    const endRadius =
      typeof outerRadius === 'number'
        ? outerRadius
        : startRadius
    const centerX = typeof cx === 'number' ? cx : Number(cx ?? 0)
    const centerY = typeof cy === 'number' ? cy : Number(cy ?? 0)

    if (!totalExpenses || percentValue < 0.06) {
      return null
    }

    const RADIAN = Math.PI / 180
    const labelRadius = startRadius + (endRadius - startRadius) * 1.2
    const normalizedMidAngle =
      typeof midAngle === 'number' ? midAngle : Number(midAngle) || 0
    const x = centerX + labelRadius * Math.cos(-normalizedMidAngle * RADIAN)
    const y = centerY + labelRadius * Math.sin(-normalizedMidAngle * RADIAN)

    const labelName = typeof name === 'string' ? name : String(name ?? '')

    return (
      <text
        x={x}
        y={y}
        fill="var(--color-text-primary)"
        fontSize={12}
        textAnchor={x > centerX ? 'start' : 'end'}
        dominantBaseline="central"
      >
        <tspan fontWeight={600}>{`${(percentValue * 100).toFixed(0)}%`}</tspan>
        <tspan x={x} dy={14} fontSize={11} fill="var(--color-text-secondary)">
          {labelName}
        </tspan>
      </text>
    )
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold leading-6 text-neutral-900 dark:text-slate-50 sm:text-lg sm:leading-7">
            Розподіл витрат
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-slate-400">
            Загалом:{' '}
            <span className="font-semibold text-neutral-900 dark:text-slate-100">
              {formatCurrency(totalExpenses)}
            </span>
          </p>
        </div>

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
      </header>

      <div className="flex flex-1 flex-col gap-6">
        <div className="flex w-full items-center justify-center">
          <div className="w-full max-w-[280px] sm:max-w-[320px]">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  innerRadius={60}
                  outerRadius={94}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        typeof viewBox !== 'object' ||
                        !('cx' in viewBox) ||
                        !('cy' in viewBox)
                      ) {
                        return null
                      }

                      const { cx, cy } = viewBox as { cx: number; cy: number }

                      return (
                        <text x={cx} y={cy} fill="var(--color-text-primary)" textAnchor="middle">
                          <tspan fontSize={12} fontWeight={600} dy={-6}>
                            Загалом
                          </tspan>
                          <tspan x={cx} dy={16} fontSize={14} fontWeight={600}>
                            {formatCurrency(totalExpenses)}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Сума']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center space-y-3 text-sm text-neutral-600 dark:text-slate-300">
          {currentData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 dark:bg-slate-800"
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-slate-100">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

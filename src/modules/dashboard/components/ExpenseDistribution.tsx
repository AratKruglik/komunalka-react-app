import type { PieLabelRenderProps } from 'recharts'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface ExpenseData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface ExpenseDistributionProps {
  data: ExpenseData[]
}

export function ExpenseDistribution({ data }: ExpenseDistributionProps) {
  const totalExpenses = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
      <header className="mb-6">
        <h2 className="text-lg font-semibold leading-7 text-neutral-900">
          Розподіл витрат
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Загалом:{' '}
          <span className="font-semibold text-neutral-900">
            ₴{totalExpenses.toLocaleString('uk-UA')}
          </span>
        </p>
      </header>

      <div className="flex flex-1 flex-col">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }: PieLabelRenderProps) => {
                const labelName = typeof name === 'string' ? name : String(name ?? '')
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0)
                if (!totalExpenses) {
                  return labelName
                }
                const percentage = ((numericValue / totalExpenses) * 100).toFixed(0)
                return `${labelName}: ${percentage}%`
              }}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`₴${value}`, 'Сума']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm text-neutral-600"
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-semibold text-neutral-900">
              ₴{item.value.toLocaleString('uk-UA')}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

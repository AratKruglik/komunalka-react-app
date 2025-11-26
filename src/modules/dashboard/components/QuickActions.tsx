import { Plus, Home, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../../../shared/components/ui'

export function QuickActions() {
  const navigate = useNavigate()

  const actions: Array<{
    id: string
    icon: LucideIcon
    label: string
    onClick: () => void
    variant?: 'solid' | 'outline'
  }> = [
    {
      id: '1',
      icon: Plus,
      label: 'Додати показання',
      variant: 'solid',
      onClick: () => console.log('Add reading'),
    },
    {
      id: '2',
      icon: Home,
      label: 'Додати адресу',
      variant: 'outline',
      onClick: () => navigate('/addresses'),
    },
    {
      id: '3',
      icon: Receipt,
      label: 'Переглянути тарифи',
      variant: 'outline',
      onClick: () => console.log('View rates'),
    },
  ]

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-5 lg:p-6">
      <header className="mb-3 sm:mb-4">
        <h2 className="text-base font-semibold leading-6 text-neutral-900 dark:text-slate-50 sm:text-lg sm:leading-7 lg:text-xl">
          Швидкі дії
        </h2>
      </header>

      {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.id}
              onClick={action.onClick}
              type="button"
              variant={action.variant ?? 'solid'}
              tone={action.variant === 'outline' ? 'neutral' : 'primary'}
              size="lg"
              className="h-12 w-full justify-center gap-2 px-5 text-sm"
            >
              <Icon className="h-5 w-5" />
              <span>{action.label}</span>
            </Button>
          )
        })}
      </div>
    </section>
  )
}

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
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
      <header className="mb-4">
        <h2 className="text-lg font-semibold leading-7 text-neutral-900">
          Швидкі дії
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
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

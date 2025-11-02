import { Plus, Home, Receipt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '../../../shared/components/ui'
import type { ButtonProps } from '../../../shared/components/ui'

export function QuickActions() {
  const navigate = useNavigate()

  const actions: Array<{
    id: string
    icon: LucideIcon
    label: string
    onClick: () => void
    buttonProps?: Partial<ButtonProps>
  }> = [
    {
      id: '1',
      icon: Plus,
      label: 'Додати показання',
      buttonProps: {
        variant: 'solid',
        tone: 'primary',
        size: 'lg',
        className: 'h-14 rounded-xl px-5 text-sm shadow-lg',
      },
      onClick: () => console.log('Add reading'),
    },
    {
      id: '2',
      icon: Home,
      label: 'Додати адресу',
      buttonProps: {
        variant: 'outline',
        tone: 'neutral',
        size: 'lg',
        className: 'h-14 rounded-xl px-5 text-sm',
      },
      onClick: () => navigate('/addresses'),
    },
    {
      id: '3',
      icon: Receipt,
      label: 'Переглянути тарифи',
      buttonProps: {
        variant: 'outline',
        tone: 'neutral',
        size: 'lg',
        className: 'h-14 rounded-xl px-5 text-sm',
      },
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
              {...action.buttonProps}
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

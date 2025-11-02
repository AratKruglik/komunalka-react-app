import { Plus, Home, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router'

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      id: '1',
      icon: Plus,
      label: 'Додати показання',
      surfaceClasses:
        'border border-primary/40 bg-primary text-text-dark shadow-lg hover:bg-primary-dark',
      onClick: () => console.log('Add reading'),
    },
    {
      id: '2',
      icon: Home,
      label: 'Додати адресу',
      surfaceClasses:
        'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100',
      onClick: () => navigate('/addresses'),
    },
    {
      id: '3',
      icon: Receipt,
      label: 'Переглянути тарифи',
      surfaceClasses:
        'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100',
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
            <button
              key={action.id}
              onClick={action.onClick}
              type="button"
              className={`flex h-14 items-center justify-center gap-3 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${action.surfaceClasses}`}
            >
              <Icon className="h-5 w-5" />
              <span>{action.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

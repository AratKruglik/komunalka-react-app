import { Plus } from 'lucide-react'
import { Button } from '../../../shared/components/ui'

interface WelcomeHeaderProps {
  userName?: string
}

export function WelcomeHeader({ userName = 'Олена' }: WelcomeHeaderProps) {
  const handleAddReading = () => {
    // Navigate to add reading page (to be implemented)
    console.log('Navigate to add reading')
  }

  const currentMonth = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white px-6 py-6 shadow-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-dark">
            Вітаємо, {userName}!
          </h1>
          <p className="text-base text-neutral-600">
            Ось огляд ваших комунальних послуг за {currentMonth}
          </p>
        </div>

        <Button onClick={handleAddReading} type="button" size="lg" className="shrink-0 px-5">
          <Plus className="h-5 w-5" strokeWidth={2.2} />
          Додати показання
        </Button>
      </div>
    </section>
  )
}

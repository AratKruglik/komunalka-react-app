import { Calendar, AlertCircle, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SERVICE_CONFIG, type ServiceType } from '../../../shared/constants/services'
import type { PaymentReminder } from '../types'

interface PaymentRemindersProps {
  reminders: PaymentReminder[]
}

export function PaymentReminders({ reminders }: PaymentRemindersProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getUrgencyIcon = (urgency: PaymentReminder['urgency']): LucideIcon => {
    switch (urgency) {
      case 'high':
        return AlertCircle
      case 'medium':
        return Clock
      case 'low':
        return Calendar
    }
  }

  const getServiceStyles = (serviceName: string) => {
    const config = SERVICE_CONFIG[serviceName as ServiceType]

    // Map service names to their background colors
    const serviceColorMap: Record<string, { bg: string; textColor: string }> = {
      'Електроенергія': { bg: 'bg-sky-50', textColor: 'text-sky-700' },
      'Газ': { bg: 'bg-amber-50', textColor: 'text-amber-700' },
      'Холодна вода': { bg: 'bg-blue-50', textColor: 'text-blue-700' },
      'Гаряча вода': { bg: 'bg-rose-50', textColor: 'text-rose-700' },
      'Водопостачання': { bg: 'bg-cyan-50', textColor: 'text-cyan-700' },
      'Опалення': { bg: 'bg-orange-50', textColor: 'text-orange-700' },
    }

    const colors = serviceColorMap[serviceName] || { bg: 'bg-neutral-50', textColor: 'text-neutral-700' }

    if (!config) {
      // Fallback to neutral colors if service not found
      return {
        bg: colors.bg,
        iconBg: 'bg-neutral-100',
        iconColor: 'text-neutral-600',
        textColor: colors.textColor,
      }
    }

    return {
      bg: colors.bg,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
      textColor: colors.textColor,
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold leading-7 text-neutral-900">
          Нагадування про оплату
        </h2>
        <button
          type="button"
          className="text-sm font-semibold leading-5 text-primary transition-colors hover:text-primary-dark"
        >
          Переглянути всі
        </button>
      </header>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const styles = getServiceStyles(reminder.serviceName)
          const Icon = getUrgencyIcon(reminder.urgency)

          return (
            <div
              key={reminder.id}
              className={`flex flex-col gap-4 rounded-xl border border-neutral-200/60 ${styles.bg} p-4 sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${styles.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                </div>

                <div>
                  <h3
                    className={`text-sm font-semibold leading-5 ${styles.textColor}`}
                  >
                    {reminder.serviceName}
                  </h3>
                  <p className="mt-1 text-xs font-medium leading-4 text-text-secondary">
                    Термін оплати: {formatDate(reminder.dueDate)} (через{' '}
                    {reminder.daysUntilDue}{' '}
                    {reminder.daysUntilDue === 1
                      ? 'день'
                      : reminder.daysUntilDue < 5
                        ? 'дні'
                        : 'днів'}
                    )
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <p className="text-sm font-bold leading-5 text-neutral-900">
                  ₴{reminder.amount.toLocaleString('uk-UA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-dark transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Оплатити
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

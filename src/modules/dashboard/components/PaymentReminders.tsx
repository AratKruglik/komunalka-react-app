import { Calendar, AlertCircle, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  SERVICE_CONFIG,
  type ServiceType,
  getServiceIcon,
} from '../../../shared/constants/services'
import { Button } from '../../../shared/components/ui'
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
    <section className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-lg sm:p-5 lg:p-6">
      {/* Header with responsive layout */}
      <header className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold leading-6 text-neutral-900 sm:text-lg sm:leading-7 lg:text-xl">
          Нагадування про оплату
        </h2>
        <Button type="button" variant="link" tone="primary" className="self-start text-sm sm:text-base">
          Переглянути всі
        </Button>
      </header>

      <div className="space-y-3 sm:space-y-3">
        {reminders.map((reminder) => {
          const styles = getServiceStyles(reminder.serviceName)
          const ServiceIcon =
            getServiceIcon(reminder.serviceName) ?? AlertCircle
          const UrgencyIcon = getUrgencyIcon(reminder.urgency)

          return (
            <div
              key={reminder.id}
              className={`flex flex-col gap-3.5 rounded-xl border border-neutral-200/60 ${styles.bg} p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${styles.iconBg}`}
                >
                  <ServiceIcon className={`h-5 w-5 ${styles.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-semibold leading-5 ${styles.textColor}`}
                  >
                    {reminder.serviceName}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                      <UrgencyIcon className="h-3 w-3" />
                      {reminder.urgency === 'high'
                        ? 'Терміново'
                        : reminder.urgency === 'medium'
                          ? 'Скоро'
                          : 'Планово'}
                    </span>
                    <p className="text-xs font-medium leading-4 text-neutral-600">
                      {formatDate(reminder.dueDate)} (через{' '}
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
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                <p className="text-base font-bold leading-5 text-neutral-900 sm:text-sm">
                  ₴{reminder.amount.toLocaleString('uk-UA', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <Button
                  type="button"
                  size="sm"
                  tone="primary"
                  className="min-h-[44px] min-w-[120px] px-4 text-sm sm:min-h-0 sm:min-w-0"
                >
                  Оплатити
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

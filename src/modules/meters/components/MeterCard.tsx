import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button, DropdownMenu, type DropdownMenuItem } from '@shared/components/ui'
import type { MeterDeviceViewModel } from '@shared/viewModels'
import { metersEditPath } from '@shared/constants/routes'

interface MeterCardProps {
  meter: MeterDeviceViewModel
  statusStyle: { badge: string; text: string }
  onDelete: (meter: MeterDeviceViewModel) => void
}

const METER_ACTIONS: DropdownMenuItem[] = [
  {
    id: 'edit',
    label: 'Редагувати',
    icon: <Pencil className="h-4 w-4" />,
  },
  {
    id: 'delete',
    label: 'Видалити',
    icon: <Trash2 className="h-4 w-4" />,
    tone: 'danger',
  },
]

export function MeterCard({ meter, statusStyle, onDelete }: MeterCardProps) {
  const navigate = useNavigate()

  const handleMenuSelect = (item: DropdownMenuItem) => {
    if (item.id === 'edit') {
      navigate(metersEditPath(meter.id))
    } else if (item.id === 'delete') {
      onDelete(meter)
    }
  }

  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 pr-10 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="absolute right-3 top-3">
        <DropdownMenu
          trigger={
            <Button
              type="button"
              size="icon"
              variant="ghost"
              tone="neutral"
              className="h-8 w-8"
              aria-label={`Дії для ${meter.name}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={METER_ACTIONS}
          onSelect={handleMenuSelect}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-base font-semibold text-gray-900 dark:text-slate-100">{meter.name}</p>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyle.badge}`}>
            {statusStyle.text}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Серійний №: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.meterNumber}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Локація: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.location}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Провайдер: <span className="font-medium text-gray-800 dark:text-slate-100">{meter.providerName}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-slate-400 sm:text-right">
        <p>
          Останні показання:{' '}
          <span className="font-semibold text-gray-900 dark:text-slate-100">{meter.lastSubmission}</span>
        </p>
        {meter.nextCheckDate ? (
          <p>
            Перевірка до:{' '}
            <span className="font-semibold text-gray-900 dark:text-slate-100">{meter.nextCheckDate}</span>
          </p>
        ) : null}
      </div>
    </div>
  )
}

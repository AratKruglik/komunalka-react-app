import { Input } from '@shared/components/ui/form/Input'
import { Label } from '@shared/components/ui/form/Label'

interface DateRangeFilterProps {
  fromDate: string
  toDate: string
  onFromChange: (date: string) => void
  onToChange: (date: string) => void
}

export function DateRangeFilter({ fromDate, toDate, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="date-from" className="text-xs text-gray-500 dark:text-slate-400">
          Від
        </Label>
        <Input
          id="date-from"
          type="date"
          value={fromDate}
          onChange={(e) => onFromChange(e.target.value)}
          className="py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="date-to" className="text-xs text-gray-500 dark:text-slate-400">
          До
        </Label>
        <Input
          id="date-to"
          type="date"
          value={toDate}
          onChange={(e) => onToChange(e.target.value)}
          className="py-1.5 text-sm"
        />
      </div>
    </div>
  )
}

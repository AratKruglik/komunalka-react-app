import { useEffect, useId, useMemo, useState, type ChangeEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button, Label, Select } from '../../../shared/components/ui'
import type { DashboardAddressOption } from '../types'

interface WelcomeHeaderProps {
  userName?: string
  addresses?: DashboardAddressOption[]
  selectedAddressId?: number
  onAddressChange?: (addressId: number) => void
}

export function WelcomeHeader({
  userName = 'Олена',
  addresses,
  selectedAddressId,
  onAddressChange,
}: WelcomeHeaderProps) {
  const handleAddReading = () => {
    // Navigate to add reading page (to be implemented)
    console.log('Navigate to add reading')
  }

  const currentMonth = new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const addressOptions = useMemo(() => addresses ?? [], [addresses])
  const [internalAddressId, setInternalAddressId] = useState<number | undefined>(
    selectedAddressId ?? addressOptions[0]?.id
  )
  const activeAddressId = selectedAddressId ?? internalAddressId
  const selectId = useId()

  useEffect(() => {
    if (selectedAddressId !== undefined) {
      setInternalAddressId(selectedAddressId)
    }
  }, [selectedAddressId])

  useEffect(() => {
    if (
      selectedAddressId === undefined &&
      addressOptions.length > 0 &&
      !internalAddressId
    ) {
      setInternalAddressId(addressOptions[0].id)
    }
  }, [addressOptions, internalAddressId, selectedAddressId])

  const selectedAddress = addressOptions.find(
    (option) => option.id === activeAddressId
  )

  const handleAddressChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newAddressId = Number(event.target.value)

    if (selectedAddressId === undefined) {
      setInternalAddressId(newAddressId)
    }

    onAddressChange?.(newAddressId)
  }

  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white px-3.5 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      {/* Mobile: stack, Desktop: row with space-between */}
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Welcome text and address selector */}
        <div className="space-y-2.5 sm:space-y-3">
          <h1 className="text-lg font-bold text-text-dark dark:text-slate-50 sm:text-xl lg:text-2xl">
            Вітаємо, {userName}!
          </h1>
          <p className="text-xs text-neutral-600 dark:text-slate-400 sm:text-sm lg:text-base">
            Ось огляд ваших комунальних послуг за {currentMonth}
          </p>
          {addressOptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={selectId} className="text-sm sm:text-base">Адреса обліку</Label>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Select
                  id={selectId}
                  value={activeAddressId}
                  onChange={handleAddressChange}
                  className="w-full text-sm sm:w-72 sm:text-base"
                >
                  {addressOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {selectedAddress?.description ? (
                  <span className="hidden text-xs text-neutral-500 sm:inline lg:text-sm">
                    {selectedAddress.description}
                  </span>
                ) : null}
              </div>
              {selectedAddress?.description ? (
                <span className="text-xs text-neutral-500 sm:hidden">
                  {selectedAddress.description}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Add reading button - full width on mobile, auto on tablet+ */}
        <Button
          onClick={handleAddReading}
          type="button"
          size="lg"
          className="w-full shrink-0 px-4 text-sm sm:w-auto sm:px-5 sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
          Додати показання
        </Button>
      </div>
    </section>
  )
}

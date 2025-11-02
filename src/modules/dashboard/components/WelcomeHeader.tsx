import { useEffect, useId, useState, type ChangeEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button, Label, Select } from '../../../shared/components/ui'
import type { DashboardAddressOption } from '../types'

interface WelcomeHeaderProps {
  userName?: string
  addresses?: DashboardAddressOption[]
  selectedAddressId?: string
  onAddressChange?: (addressId: string) => void
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

  const addressOptions = addresses ?? []
  const [internalAddressId, setInternalAddressId] = useState(
    selectedAddressId ?? addressOptions[0]?.id ?? ''
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
    const newAddressId = event.target.value

    if (selectedAddressId === undefined) {
      setInternalAddressId(newAddressId)
    }

    onAddressChange?.(newAddressId)
  }

  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white px-6 py-6 shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-text-dark">
            Вітаємо, {userName}!
          </h1>
          <p className="text-base text-neutral-600">
            Ось огляд ваших комунальних послуг за {currentMonth}
          </p>
          {addressOptions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={selectId}>Адреса обліку</Label>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Select
                  id={selectId}
                  value={activeAddressId}
                  onChange={handleAddressChange}
                  className="w-full sm:w-72"
                >
                  {addressOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {selectedAddress?.description ? (
                  <span className="hidden text-xs text-neutral-500 sm:inline">
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

        <Button
          onClick={handleAddReading}
          type="button"
          size="lg"
          className="shrink-0 px-5"
        >
          <Plus className="h-5 w-5" strokeWidth={2.2} />
          Додати показання
        </Button>
      </div>
    </section>
  )
}

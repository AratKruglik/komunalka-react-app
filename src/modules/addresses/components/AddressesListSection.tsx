import { Plus } from 'lucide-react'
import { AddressCard } from './AddressCard'
import { Button } from '../../../shared/components/ui'
import {
  MOCK_ADDRESSES,
  getMetersByAddressId,
} from '../../../shared/data/mockDatabase'
import {
  toAddressCardViewModel,
  type AddressCardViewModel,
} from '../../../shared/viewModels'

interface AddressesListSectionProps {
  addresses?: AddressCardViewModel[]
  onAddAddress?: () => void
}

export function AddressesListSection({
  addresses,
  onAddAddress,
}: AddressesListSectionProps) {
  // Generate address view models from centralized database
  const defaultAddresses = MOCK_ADDRESSES.map((address) => {
    const meters = getMetersByAddressId(address.id)
    return toAddressCardViewModel(address, meters)
  })

  const addressViewModels = addresses ?? defaultAddresses
  return (
    <section className="w-full overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900 dark:border dark:border-slate-800">
      {/* Header section with responsive layout */}
      <div className="flex flex-col gap-3 px-3.5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-6 lg:px-6">
        <div>
          <h1 className="text-xl font-bold leading-7 text-gray-800 dark:text-slate-100 sm:text-2xl sm:leading-8 lg:text-[24px] lg:leading-[32px]">
            Мої адреси
          </h1>
          <p className="mt-0.5 text-sm leading-5 text-gray-600 dark:text-slate-400 sm:mt-1 sm:text-base sm:leading-6 lg:text-[16px] lg:leading-[24px]">
            Керуйте адресами для комунальних послуг
          </p>
        </div>
        <Button
          type="button"
          size="md"
          className="w-full min-w-0 text-sm sm:w-auto sm:min-w-[166px] sm:text-base"
          onClick={onAddAddress}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Додати адресу</span>
        </Button>
      </div>

      {/* Address cards grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols, Wide: 4 cols */}
      <div className="grid gap-4 px-3.5 pb-5 sm:gap-5 sm:px-5 sm:pb-6 md:grid-cols-2 lg:gap-6 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
        {addressViewModels.map((address) => (
          <AddressCard key={address.id} {...address} />
        ))}
      </div>
    </section>
  )
}

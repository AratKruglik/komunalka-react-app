import { Plus } from 'lucide-react'
import { AddressCard } from './AddressCard'
import { Button } from '@shared/components/ui'
import { useAddresses } from '../hooks'
import {
  toAddressCardViewModel,
  type AddressCardViewModel,
} from '@shared/viewModels'

interface AddressesListSectionProps {
  addresses?: AddressCardViewModel[]
  onAddAddress?: () => void
}

export function AddressesListSection({
  addresses,
  onAddAddress,
}: AddressesListSectionProps) {
  const { addresses: fetchedAddresses, isLoading, error, refetch } = useAddresses()

  // Use prop if provided, otherwise use API data
  const addressViewModels = addresses ?? (fetchedAddresses
    ? fetchedAddresses.map((address) => toAddressCardViewModel(address, []))
    : [])

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

      {/* Error state */}
      {error && !addresses ? (
        <div className="flex flex-col items-center justify-center gap-4 px-3.5 pb-8 pt-4 sm:px-5 lg:px-6">
          <p className="text-center text-sm text-red-600 dark:text-red-400">
            Помилка завантаження адрес: {error}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Спробувати знову
          </Button>
        </div>
      ) : null}

      {/* Loading state */}
      {isLoading && !addresses ? (
        <div className="grid gap-4 px-3.5 pb-5 sm:gap-5 sm:px-5 sm:pb-6 md:grid-cols-2 lg:gap-6 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <AddressCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {/* Address cards grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols, Wide: 4 cols */}
      {!isLoading && !error && addressViewModels.length > 0 ? (
        <div className="grid gap-4 px-3.5 pb-5 sm:gap-5 sm:px-5 sm:pb-6 md:grid-cols-2 lg:gap-6 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
          {addressViewModels.map((address) => (
            <AddressCard key={address.id} {...address} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function AddressCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Header skeleton */}
      <div className="mb-3 flex items-start justify-between">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700" />
      </div>

      {/* Address text skeleton */}
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700" />
      </div>

      {/* Meters skeleton */}
      <div className="mb-3 space-y-2">
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-slate-700" />
    </div>
  )
}

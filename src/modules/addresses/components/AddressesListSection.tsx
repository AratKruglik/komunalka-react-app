import { Plus } from 'lucide-react'
import { AddressCard } from './AddressCard'
import { mockAddressCards, type AddressCardData } from './addressCardData'
import { Button } from '../../../shared/components/ui'

interface AddressesListSectionProps {
  addresses?: AddressCardData[]
  onAddAddress?: () => void
}

export function AddressesListSection({
  addresses = mockAddressCards,
  onAddAddress,
}: AddressesListSectionProps) {
  return (
    <section className="w-full rounded-lg shadow-lg bg-white overflow-hidden">
      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold leading-[32px] text-gray-800">
            Мої адреси
          </h1>
          <p className="text-[16px] leading-[24px] text-gray-600">
            Керуйте адресами для комунальних послуг
          </p>
        </div>
        <Button
          type="button"
          size="md"
          className="min-w-[166px]"
          onClick={onAddAddress}
        >
          <Plus className="h-4 w-4" />
          <span>Додати адресу</span>
        </Button>
      </div>

      <div className="grid gap-6 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {addresses.map((address) => (
          <AddressCard key={address.id} {...address} />
        ))}
      </div>
    </section>
  )
}

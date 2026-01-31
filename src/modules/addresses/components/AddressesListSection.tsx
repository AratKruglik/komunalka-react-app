import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { AddressCard } from './AddressCard'
import { Button, ConfirmDialog } from '@shared/components/ui'
import { useAddressContext } from '@shared/contexts'
import {
  toAddressCardViewModel,
  type AddressCardViewModel,
} from '@shared/viewModels'
import { ROUTES } from '@shared/constants'

interface AddressesListSectionProps {
  addresses?: AddressCardViewModel[]
  onAddAddress?: () => void
}

interface DeleteDialogState {
  isOpen: boolean
  addressId: number | null
  addressTitle: string
}

export function AddressesListSection({
  addresses: propAddresses,
  onAddAddress,
}: AddressesListSectionProps) {
  const navigate = useNavigate()
  const {
    addresses: contextAddresses,
    isLoading,
    error,
    deleteAddress,
    updateAddress,
  } = useAddressContext()

  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    addressId: null,
    addressTitle: '',
  })

  const handleEditAddress = (addressId: number) => {
    navigate(`${ROUTES.METERS}?addressId=${addressId}`)
  }

  const handleDeleteClick = (addressId: number) => {
    const address = addressViewModels.find((a) => a.id === addressId)
    setDeleteDialog({
      isOpen: true,
      addressId,
      addressTitle: address?.title ?? '',
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.addressId) return

    setIsDeleting(true)
    try {
      await deleteAddress(deleteDialog.addressId)
      setDeleteDialog({ isOpen: false, addressId: null, addressTitle: '' })
    } catch {
      // Error is handled by the context
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, addressId: null, addressTitle: '' })
  }

  const handleSetPrimary = async (addressId: number) => {
    setIsUpdating(true)
    try {
      await updateAddress(addressId, { isPrimary: true })
    } catch {
      // Error is handled by the context
    } finally {
      setIsUpdating(false)
    }
  }

  const addressViewModels = propAddresses ?? contextAddresses.map((address) =>
    toAddressCardViewModel(address, [])
  )

  return (
    <section className="w-full overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900 dark:border dark:border-slate-800">
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

      {error && !propAddresses ? (
        <div className="flex flex-col items-center justify-center gap-4 px-3.5 pb-8 pt-4 sm:px-5 lg:px-6">
          <p className="text-center text-sm text-red-600 dark:text-red-400">
            Помилка завантаження адрес: {error}
          </p>
        </div>
      ) : null}

      {isLoading && !propAddresses ? (
        <div className="grid gap-4 px-3.5 pb-5 sm:gap-5 sm:px-5 sm:pb-6 md:grid-cols-2 lg:gap-6 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <AddressCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {!isLoading && !error && addressViewModels.length > 0 ? (
        <div className="grid gap-4 px-3.5 pb-5 sm:gap-5 sm:px-5 sm:pb-6 md:grid-cols-2 lg:gap-6 lg:px-6 xl:grid-cols-3 2xl:grid-cols-4">
          {addressViewModels.map((address) => (
            <AddressCard
              key={address.id}
              {...address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteClick}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      ) : null}

      {isUpdating && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-white px-6 py-4 shadow-xl dark:bg-slate-900">
            <p className="text-sm text-gray-700 dark:text-slate-200">
              Оновлення адреси...
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Видалити адресу?"
        description={
          <>
            Ви впевнені, що хочете видалити адресу{' '}
            <strong className="text-gray-900 dark:text-slate-50">
              {deleteDialog.addressTitle}
            </strong>
            ? Цю дію неможливо скасувати.
          </>
        }
        confirmLabel="Видалити"
        cancelLabel="Скасувати"
        variant="danger"
        isLoading={isDeleting}
      />
    </section>
  )
}

function AddressCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-700" />
      </div>

      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-700" />
      </div>

      <div className="mb-3 space-y-2">
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="h-9 w-full rounded-md bg-gray-200 dark:bg-slate-700" />
    </div>
  )
}

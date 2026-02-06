import { Building2, Loader2, MapPin, Pencil, Plus, Shield, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthenticatedLayout } from '@shared/components/layout/AuthenticatedLayout'
import { PageSectionHeader } from '@shared/components/pages'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
} from '@shared/components/ui'
import { useAddresses } from '@/modules/addresses/hooks'
import { useServiceProviders, useDeleteServiceProvider } from '../hooks'
import { formatApiTariffLabel } from '@shared/utils/providerTariffs'
import type { ApiServiceProvider } from '@shared/types/api'
import type { Address } from '@shared/types/entities'

interface GroupedProviders {
  address: Address
  providers: ApiServiceProvider[]
}

export default function ProvidersPage() {
  const navigate = useNavigate()
  const { addresses, isLoading: addressesLoading } = useAddresses()
  const { providers, isLoading: providersLoading, refetch } = useServiceProviders()
  const { deleteProvider, isLoading: isDeleting } = useDeleteServiceProvider()

  const [deleteConfirm, setDeleteConfirm] = useState<ApiServiceProvider | null>(null)

  const groupedByAddress = useMemo((): GroupedProviders[] => {
    const addressMap = new Map<number, Address>()
    addresses.forEach((addr) => addressMap.set(addr.id, addr))

    const groups = new Map<number, ApiServiceProvider[]>()
    providers.forEach((provider) => {
      const existing = groups.get(provider.addressId) ?? []
      existing.push(provider)
      groups.set(provider.addressId, existing)
    })

    return Array.from(groups.entries())
      .map(([addressId, providerList]) => ({
        address: addressMap.get(addressId)!,
        providers: providerList,
      }))
      .filter((group) => group.address)
      .sort((a, b) => {
        if (a.address.isPrimary && !b.address.isPrimary) return -1
        if (!a.address.isPrimary && b.address.isPrimary) return 1
        return a.address.id - b.address.id
      })
  }, [addresses, providers])

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const success = await deleteProvider(deleteConfirm.id)
    if (success) {
      setDeleteConfirm(null)
      refetch()
    }
  }

  const formatAddressDisplay = (address: Address): string => {
    const parts = [address.city, address.street, address.buildingNumber]
    if (address.apartmentNumber) {
      parts.push(`кв. ${address.apartmentNumber}`)
    }
    return parts.join(', ')
  }

  const isLoading = addressesLoading || providersLoading

  return (
    <AuthenticatedLayout
      pageTitle="Мої провайдери"
      pageSubtitle="Керуйте тарифами води, газу, електрики та тепла в одному місці"
    >
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <PageSectionHeader
            title="Журнал провайдерів"
            description="Додавайте постачальників комунальних послуг для кожної адреси для автоматичного розрахунку вартості."
            withBorder
            className="pb-4"
            titleClassName="text-2xl font-bold text-dark dark:text-slate-50"
            ctaButton={{
              label: 'Додати провайдера',
              icon: <Plus className="h-4 w-4 sm:h-5 sm:w-5" />,
              onClick: () => navigate('/providers/new'),
              className: 'w-full min-w-0 text-sm sm:w-auto sm:min-w-[188px] sm:text-base',
            }}
          />

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <p className="text-base font-semibold text-dark dark:text-slate-100">Що далі?</p>
                <p className="mt-1">
                  Після збереження провайдерів ми зможемо автоматично розраховувати вартість
                  комунальних послуг при внесенні показників лічильників.
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <p className="flex items-center gap-2 text-base font-semibold text-dark dark:text-slate-100">
                  <Shield className="h-4 w-4" />
                  Безпека даних
                </p>
                <p className="mt-1">
                  Дані про тарифи зберігаються лише для вашого акаунта. Ви можете редагувати або
                  видаляти їх у будь-який момент.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : groupedByAddress.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 py-12 dark:border-slate-700 dark:bg-slate-800">
                <Building2 className="mb-4 h-12 w-12 text-gray-300 dark:text-slate-600" />
                <p className="text-lg font-medium text-gray-600 dark:text-slate-300">
                  Провайдерів поки немає
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Додайте першого провайдера для однієї з ваших адрес
                </p>
                <Button
                  type="button"
                  variant="solid"
                  tone="primary"
                  className="mt-4"
                  onClick={() => navigate('/providers/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додати провайдера
                </Button>
              </div>
            ) : (
              <section className="space-y-6">
                {groupedByAddress.map(({ address, providers: addressProviders }) => (
                  <Card
                    key={address.id}
                    className="border border-gray-200 shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <CardHeader className="gap-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        {formatAddressDisplay(address)}
                        {address.isPrimary && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            Основна
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {addressProviders.length}{' '}
                        {addressProviders.length === 1 ? 'провайдер' : 'провайдерів'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {addressProviders.map((provider) => (
                        <ProviderCard
                          key={provider.id}
                          provider={provider}
                          onEdit={() => navigate(`/providers/${provider.id}/edit`)}
                          onDelete={() => setDeleteConfirm(provider)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Видалити провайдера?"
        description={
          <>
            Ви впевнені, що хочете видалити провайдера{' '}
            <strong>{deleteConfirm?.name}</strong>? Цю дію неможливо скасувати.
          </>
        }
        confirmLabel="Видалити"
        cancelLabel="Скасувати"
        variant="danger"
        isLoading={isDeleting}
      />
    </AuthenticatedLayout>
  )
}

interface ProviderCardProps {
  provider: ApiServiceProvider
  onEdit: () => void
  onDelete: () => void
}

function ProviderCard({ provider, onEdit, onDelete }: ProviderCardProps) {
  return (
    <article className="space-y-3 rounded-lg border border-gray-100 p-3 dark:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-dark dark:text-slate-100">{provider.name}</p>
          {provider.website && (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              <a
                href={provider.website}
                target="_blank"
                rel="noreferrer"
                className="text-yellow-700 underline hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
              >
                {provider.website.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button
            type="button"
            size="icon"
            variant="outline"
            tone="neutral"
            className="h-8 w-8 text-gray-600"
            aria-label={`Редагувати ${provider.name}`}
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            tone="neutral"
            className="h-8 w-8 text-gray-600"
            aria-label={`Видалити ${provider.name}`}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {provider.description && (
        <p className="text-sm text-gray-600 dark:text-slate-300">{provider.description}</p>
      )}
      {provider.tariffs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Тарифи
          </p>
          <div className="flex flex-wrap gap-2">
            {provider.tariffs.map((tariff) => (
              <span
                key={tariff.id}
                className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-amber-300/30 dark:bg-amber-200/10 dark:text-amber-100"
              >
                <span>
                  {tariff.notes || tariff.utilityTypeName}
                  {tariff.pricingModel && tariff.pricingModel !== 'fixed' && (
                    <span className="ml-1 text-amber-600 dark:text-amber-300">
                      ({tariff.pricingModel})
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-200">
                  {formatApiTariffLabel(tariff)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
      {(provider.phone || provider.email) && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-slate-400">
          {provider.phone && <span>{provider.phone}</span>}
          {provider.email && <span>{provider.email}</span>}
        </div>
      )}
    </article>
  )
}

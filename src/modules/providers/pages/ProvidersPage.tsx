import { Pencil, Plug, Plus, Shield, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import { PageSectionHeader } from '../../../shared/components/pages'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui'
import { MOCK_PROVIDERS } from '../../../shared/data/mockDatabase'
import { formatTariffLabel, getPrimaryTariff } from '../../../shared/utils/providerTariffs'

export default function ProvidersPage() {
  const navigate = useNavigate()
  const groupedProviders = useMemo(() => {
    return MOCK_PROVIDERS.reduce<Record<string, typeof MOCK_PROVIDERS>>((groups, provider) => {
      const key = provider.serviceLabel
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(provider)
      return groups
    }, {})
  }, [])

  return (
    <AuthenticatedLayout
      pageTitle="Мої провайдери"
      pageSubtitle="Керуйте тарифами води, газу, електрики та тепла в одному місці"
    >
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <PageSectionHeader
            title="Журнал провайдерів"
            description="Ми скоро додамо таблицю з тарифами. А поки що ви можете створювати провайдерів для майбутнього використання."
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
                  Після збереження провайдерів ми зможемо автоматично підказувати тарифи під час додавання адрес, лічильників і платежів.
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <p className="flex items-center gap-2 text-base font-semibold text-dark dark:text-slate-100">
                  <Shield className="h-4 w-4" />
                  Безпека даних
                </p>
                <p className="mt-1">
                  Дані про тарифи зберігаються лише для вашого акаунта. Ви можете редагувати або видаляти їх у будь-який момент.
                </p>
              </div>
            </div>

            <section className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-dark dark:text-slate-100">Шаблони провайдерів</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Використайте їх як основу для власних тарифів</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(groupedProviders).map(([serviceLabel, providers]) => (
                  <Card key={serviceLabel} className="border border-gray-200 shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="gap-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Plug className="h-4 w-4 text-amber-500" />
                        {serviceLabel}
                      </CardTitle>
                      <CardDescription>
                        {providers.length} {providers.length === 1 ? 'провайдер' : 'провайдерів'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {providers.map((provider) => (
                        <article
                          key={provider.id}
                          className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-dark dark:text-slate-100">{provider.name}</p>
                              {provider.website ? (
                                <p className="text-sm text-gray-500 dark:text-slate-400">
                                  <a
                                    href={provider.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline"
                                  >
                                    {provider.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex gap-1.5">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  tone="neutral"
                                  className="h-8 w-8 text-gray-600"
                                  aria-label={`Редагувати ${provider.name}`}
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
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Badge variant="neutral">
                                {(() => {
                                  const primaryTariff = getPrimaryTariff(provider)
                                  if (!primaryTariff) return provider.unitLabel
                                  return `${primaryTariff.name} · ${primaryTariff.price.toFixed(2)} ${provider.unitLabel}`
                                })()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-slate-300">{provider.description}</p>
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
                                  <span>{tariff.name}</span>
                                  <span className="text-[11px] font-medium text-amber-700 dark:text-amber-200">
                                    {formatTariffLabel(tariff.price, provider.unitLabel)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}

import { Pencil, Plug, Plus, Shield, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { AuthenticatedLayout } from '../../../shared/components/layout/AuthenticatedLayout'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../shared/components/ui'
import { MOCK_PROVIDER_TEMPLATES } from '../../../shared/data/mockProviders'

export default function ProvidersPage() {
  const navigate = useNavigate()
  const groupedProviders = useMemo(() => {
    return MOCK_PROVIDER_TEMPLATES.reduce<Record<string, typeof MOCK_PROVIDER_TEMPLATES>>((groups, provider) => {
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
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-dark">Журнал провайдерів</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Ми скоро додамо таблицю з тарифами. А поки що ви можете створювати провайдерів для майбутнього використання.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="md"
              tone="primary"
              className="w-full min-w-0 text-sm sm:w-auto sm:min-w-[188px] sm:text-base"
              onClick={() => navigate('/providers/new')}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Додати провайдера</span>
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="text-base font-semibold text-dark">Що далі?</p>
                <p className="mt-1">
                  Після збереження провайдерів ми зможемо автоматично підказувати тарифи під час додавання адрес, лічильників і платежів.
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="flex items-center gap-2 text-base font-semibold text-dark">
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
                <p className="text-lg font-semibold text-dark">Шаблони провайдерів</p>
                <p className="text-sm text-gray-500">Використайте їх як основу для власних тарифів</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(groupedProviders).map(([serviceLabel, providers]) => (
                  <Card key={serviceLabel} className="border border-gray-200 shadow-sm">
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
                          className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-dark">{provider.name}</p>
                              {provider.website ? (
                                <p className="text-sm text-gray-500">
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
                              <Badge tone="neutral">
                                {provider.unitPrice.toFixed(2)} {provider.unitLabel}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{provider.description}</p>
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

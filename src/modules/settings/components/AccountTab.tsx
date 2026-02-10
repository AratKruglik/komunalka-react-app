import { Download } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
} from '@shared/components/ui'
import { dangerZone } from '../styles'
import { useDeleteAccount } from '../hooks/useDeleteAccount'
import { useExportData } from '../hooks/useExportData'

export function AccountTab() {
  const { isConfirmOpen, isDeleting, error, openConfirm, closeConfirm, confirmDelete } =
    useDeleteAccount()
  const { isExporting, exportCSV } = useExportData()

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-lg dark:border-slate-800">
        <CardHeader>
          <CardTitle>Експорт даних</CardTitle>
          <CardDescription>Завантажте копію ваших даних</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            tone="primary"
            loading={isExporting}
            loadingText="Експортування..."
            onClick={exportCSV}
          >
            <Download className="h-4 w-4" />
            Експортувати дані (CSV)
          </Button>
        </CardContent>
      </Card>

      <div className={dangerZone()}>
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Небезпечна зона
        </h3>
        <p className="mt-1 text-sm text-red-600/80 dark:text-red-300/70">
          Видалення акаунта призведе до безповоротної втрати всіх ваших даних, включаючи адреси,
          лічильники та показники.
        </p>

        {error ? (
          <Alert variant="danger" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          variant="outline"
          tone="danger"
          className="mt-4"
          onClick={openConfirm}
        >
          Видалити акаунт
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        variant="danger"
        title="Видалити акаунт?"
        description="Цю дію неможливо скасувати. Всі ваші дані, адреси, лічильники та показники будуть видалені назавжди."
        confirmLabel="Так, видалити акаунт"
        isLoading={isDeleting}
      />
    </div>
  )
}

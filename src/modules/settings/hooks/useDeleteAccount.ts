import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { userService } from '@shared/api'
import { useAuth } from '@shared/hooks/useAuth'
import { ROUTES } from '@shared/constants/routes'

export function useDeleteAccount() {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openConfirm = useCallback(() => {
    setError(null)
    setIsConfirmOpen(true)
  }, [])

  const closeConfirm = useCallback(() => {
    if (!isDeleting) {
      setIsConfirmOpen(false)
    }
  }, [isDeleting])

  const confirmDelete = useCallback(async () => {
    if (!state.user) return

    setIsDeleting(true)
    setError(null)

    try {
      await userService.delete(state.user.id)
      logout()
      navigate(ROUTES.LOGIN, { replace: true })
    } catch {
      setError('Не вдалося видалити акаунт. Спробуйте пізніше.')
      setIsDeleting(false)
    }
  }, [state.user, logout, navigate])

  return {
    isConfirmOpen,
    isDeleting,
    error,
    openConfirm,
    closeConfirm,
    confirmDelete,
  }
}

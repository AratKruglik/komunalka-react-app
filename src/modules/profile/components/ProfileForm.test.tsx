import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
  createAuthenticatedState,
  createMockUser,
} from '@test-utils'
import { ProfileForm } from './ProfileForm'
import { useProfile } from '../hooks'
import type { User } from '@shared/types/auth'

vi.mock('../hooks', () => ({
  useProfile: vi.fn(),
}))

const mockUser: User = createMockUser({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '501234567',
})

function setupDefaultMocks(overrides: {
  user?: User | null
  isLoading?: boolean
  error?: string | null
  isSuccess?: boolean
} = {}) {
  const {
    user = mockUser,
    isLoading = false,
    error = null,
    isSuccess = false,
  } = overrides

  const mockUpdateProfile = vi.fn().mockResolvedValue(undefined)
  const mockClearError = vi.fn()

  vi.mocked(useProfile).mockReturnValue({
    user,
    isLoading,
    error,
    isSuccess,
    updateProfile: mockUpdateProfile,
    clearError: mockClearError,
  })

  return {
    mockUpdateProfile,
    mockClearError,
  }
}

describe('ProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders basic information card', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByText('Основна інформація')).toBeInTheDocument()
    })

    it('renders password change card', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByText('Зміна паролю')).toBeInTheDocument()
    })

    it('renders all profile fields', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Імʼя')).toBeInTheDocument()
      expect(screen.getByLabelText('Прізвище')).toBeInTheDocument()
      expect(screen.getByLabelText("Ім'я користувача")).toBeInTheDocument()
      expect(screen.getByLabelText('Електронна пошта')).toBeInTheDocument()
      expect(screen.getByLabelText('Номер телефону')).toBeInTheDocument()
    })

    it('renders password fields', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Поточний пароль')).toBeInTheDocument()
      expect(screen.getByLabelText('Новий пароль')).toBeInTheDocument()
      expect(screen.getByLabelText('Підтвердити новий пароль')).toBeInTheDocument()
    })

    it('renders avatar upload section', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Аватар')).toBeInTheDocument()
    })

    it('renders submit button', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /зберегти зміни/i })).toBeInTheDocument()
    })

    it('renders cancel button when onCancel is provided', () => {
      setupDefaultMocks()
      const onCancel = vi.fn()

      renderWithProviders(<ProfileForm onCancel={onCancel} />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /скасувати/i })).toBeInTheDocument()
    })

    it('does not render cancel button when onCancel is not provided', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.queryByRole('button', { name: /скасувати/i })).not.toBeInTheDocument()
    })
  })

  describe('form prefilling', () => {
    it('prefills form with user data', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Імʼя')).toHaveValue('Test')
      expect(screen.getByLabelText('Прізвище')).toHaveValue('User')
      expect(screen.getByLabelText("Ім'я користувача")).toHaveValue('testuser')
      expect(screen.getByLabelText('Електронна пошта')).toHaveValue('test@example.com')
    })

    it('handles missing user data gracefully', () => {
      setupDefaultMocks({ user: null })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Імʼя')).toHaveValue('')
      expect(screen.getByLabelText('Прізвище')).toHaveValue('')
    })
  })

  describe('validation', () => {
    it('shows error when username is empty', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const usernameInput = screen.getByLabelText("Ім'я користувача")
      await user.clear(usernameInput)

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/ім'я користувача обов'язкове/i)).toBeInTheDocument()
      })
    })

    it('shows error when username is too short', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const usernameInput = screen.getByLabelText("Ім'я користувача")
      await user.clear(usernameInput)
      await user.type(usernameInput, 'ab')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/ім'я користувача повинно містити мінімум 3 символи/i)).toBeInTheDocument()
      })
    })

    it('shows error when first name is empty', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const firstNameInput = screen.getByLabelText('Імʼя')
      await user.clear(firstNameInput)

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/ім'я обов'язкове/i)).toBeInTheDocument()
      })
    })

    it('shows error when last name is empty', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const lastNameInput = screen.getByLabelText('Прізвище')
      await user.clear(lastNameInput)

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/прізвище обовʼязкове/i)).toBeInTheDocument()
      })
    })

    it('shows error when email is empty', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const emailInput = screen.getByLabelText('Електронна пошта')
      await user.clear(emailInput)

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/електронна пошта обов'язкова/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const emailInput = screen.getByLabelText('Електронна пошта')
      await user.clear(emailInput)
      await user.type(emailInput, 'test@invalid')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/невірний формат електронної пошти/i)).toBeInTheDocument()
      })
    })

    it('shows error when phone is empty', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const phoneInput = screen.getByLabelText('Номер телефону')
      await user.clear(phoneInput)

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/номер телефону обов'язковий/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid phone format', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const phoneInput = screen.getByLabelText('Номер телефону')
      await user.clear(phoneInput)
      await user.type(phoneInput, '12345')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/введіть коректний номер телефону/i)).toBeInTheDocument()
      })
    })
  })

  describe('password validation', () => {
    it('shows error when current password is empty but new password is provided', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const newPasswordInput = screen.getByLabelText('Новий пароль')
      await user.type(newPasswordInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/введіть поточний пароль/i)).toBeInTheDocument()
      })
    })

    it('shows error when new password is empty but current password is provided', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const currentPasswordInput = screen.getByLabelText('Поточний пароль')
      await user.type(currentPasswordInput, 'currentpassword')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/введіть новий пароль/i)).toBeInTheDocument()
      })
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const currentPasswordInput = screen.getByLabelText('Поточний пароль')
      const newPasswordInput = screen.getByLabelText('Новий пароль')
      const confirmPasswordInput = screen.getByLabelText('Підтвердити новий пароль')

      await user.type(currentPasswordInput, 'currentpassword')
      await user.type(newPasswordInput, 'NewPassword123!')
      await user.type(confirmPasswordInput, 'DifferentPassword123!')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/паролі не співпадають/i)).toBeInTheDocument()
      })
    })

    it('shows error when confirm password is empty but new password is provided', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const currentPasswordInput = screen.getByLabelText('Поточний пароль')
      const newPasswordInput = screen.getByLabelText('Новий пароль')

      await user.type(currentPasswordInput, 'currentpassword')
      await user.type(newPasswordInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/підтвердіть новий пароль/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls updateProfile with correct data', async () => {
      const user = userEvent.setup()
      const { mockUpdateProfile } = setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+380501234567',
          currentPassword: undefined,
          newPassword: undefined,
          confirmNewPassword: undefined,
          avatar: undefined,
        })
      })
    })

    it('includes password fields in submission when changing password', async () => {
      const user = userEvent.setup()
      const { mockUpdateProfile } = setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const currentPasswordInput = screen.getByLabelText('Поточний пароль')
      const newPasswordInput = screen.getByLabelText('Новий пароль')
      const confirmPasswordInput = screen.getByLabelText('Підтвердити новий пароль')

      await user.type(currentPasswordInput, 'currentpassword')
      await user.type(newPasswordInput, 'NewPassword123!')
      await user.type(confirmPasswordInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            currentPassword: 'currentpassword',
            newPassword: 'NewPassword123!',
            confirmNewPassword: 'NewPassword123!',
          })
        )
      })
    })
  })

  describe('loading state', () => {
    it('shows loading text on submit button when loading', () => {
      setupDefaultMocks({ isLoading: true })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /збереження\.\.\./i })).toBeInTheDocument()
    })

    it('disables form inputs when loading', () => {
      setupDefaultMocks({ isLoading: true })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Імʼя')).toBeDisabled()
      expect(screen.getByLabelText('Прізвище')).toBeDisabled()
      expect(screen.getByLabelText("Ім'я користувача")).toBeDisabled()
      expect(screen.getByLabelText('Електронна пошта')).toBeDisabled()
    })

    it('disables password inputs when loading', () => {
      setupDefaultMocks({ isLoading: true })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByLabelText('Поточний пароль')).toBeDisabled()
      expect(screen.getByLabelText('Новий пароль')).toBeDisabled()
      expect(screen.getByLabelText('Підтвердити новий пароль')).toBeDisabled()
    })

    it('disables cancel button when loading', () => {
      setupDefaultMocks({ isLoading: true })
      const onCancel = vi.fn()

      renderWithProviders(<ProfileForm onCancel={onCancel} />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /скасувати/i })).toBeDisabled()
    })
  })

  describe('success state', () => {
    it('shows success message when isSuccess is true', () => {
      setupDefaultMocks({ isSuccess: true })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByText(/профіль успішно оновлено/i)).toBeInTheDocument()
    })

    it('clears password fields after successful update', async () => {
      const user = userEvent.setup()
      const { mockUpdateProfile } = setupDefaultMocks()
      mockUpdateProfile.mockResolvedValue(undefined)

      const { rerender } = renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const currentPasswordInput = screen.getByLabelText('Поточний пароль')
      const newPasswordInput = screen.getByLabelText('Новий пароль')
      const confirmPasswordInput = screen.getByLabelText('Підтвердити новий пароль')

      await user.type(currentPasswordInput, 'currentpassword')
      await user.type(newPasswordInput, 'NewPassword123!')
      await user.type(confirmPasswordInput, 'NewPassword123!')

      setupDefaultMocks({ isSuccess: true })

      rerender(<ProfileForm />)

      await waitFor(() => {
        expect(screen.getByLabelText('Поточний пароль')).toHaveValue('')
        expect(screen.getByLabelText('Новий пароль')).toHaveValue('')
        expect(screen.getByLabelText('Підтвердити новий пароль')).toHaveValue('')
      })
    })
  })

  describe('error state', () => {
    it('shows error message when error is present', () => {
      setupDefaultMocks({ error: 'Помилка оновлення профілю' })

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByText('Помилка оновлення профілю')).toBeInTheDocument()
    })

    it('calls clearError when form is submitted', async () => {
      const user = userEvent.setup()
      const { mockClearError } = setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const submitButton = screen.getByRole('button', { name: /зберегти зміни/i })
      await user.click(submitButton)

      expect(mockClearError).toHaveBeenCalled()
    })
  })

  describe('cancel button', () => {
    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()
      const onCancel = vi.fn()

      renderWithProviders(<ProfileForm onCancel={onCancel} />, {
        authContext: { state: createAuthenticatedState() },
      })

      const cancelButton = screen.getByRole('button', { name: /скасувати/i })
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('avatar upload', () => {
    it('renders avatar dropzone', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByText(/перетягніть фото сюди/i)).toBeInTheDocument()
    })

    it('renders clear avatar button', () => {
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /очистити аватар/i })).toBeInTheDocument()
    })
  })

  describe('phone input', () => {
    it('strips non-numeric characters from phone input', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<ProfileForm />, {
        authContext: { state: createAuthenticatedState() },
      })

      const phoneInput = screen.getByLabelText('Номер телефону')
      await user.clear(phoneInput)
      await user.type(phoneInput, '50-123-4567')

      expect(phoneInput).toHaveValue('501234567')
    })
  })
})

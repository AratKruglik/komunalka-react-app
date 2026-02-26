import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from './LoginForm'
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
  createMockAuthState,
} from '@test-utils'

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function getPasswordInput() {
  return screen.getByPlaceholderText('••••••••')
}

function getEmailInput() {
  return screen.getByPlaceholderText('ваша@пошта.com')
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders email and password fields', () => {
      renderWithProviders(<LoginForm />)

      expect(getEmailInput()).toBeInTheDocument()
      expect(getPasswordInput()).toBeInTheDocument()
    })

    it('renders remember me checkbox', () => {
      renderWithProviders(<LoginForm />)

      expect(screen.getByRole('checkbox', { name: /запам.*ятати мене/i })).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderWithProviders(<LoginForm />)

      expect(screen.getByRole('button', { name: /^увійти$/i })).toBeInTheDocument()
    })

    it('renders social login buttons', () => {
      renderWithProviders(<LoginForm />)

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      renderWithProviders(<LoginForm />)

      expect(screen.getByRole('link', { name: /забули пароль/i })).toBeInTheDocument()
    })
  })

  describe('email validation', () => {
    it('shows error when email is empty on submit', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LoginForm />)

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/електронна пошта обов.*язкова/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LoginForm />)

      await user.type(getEmailInput(), 'test@invalid')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/невірний формат електронної пошти/i)).toBeInTheDocument()
      })
    })

    it('accepts valid email format', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      await user.type(getEmailInput(), 'valid@email.com')
      await user.type(getPasswordInput(), 'password123')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('valid@email.com', 'password123', false)
      })
    })
  })

  describe('password validation', () => {
    it('shows error when password is empty on submit', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LoginForm />)

      await user.type(getEmailInput(), 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/пароль обов.*язковий/i)).toBeInTheDocument()
      })
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LoginForm />)

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), '12345')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/пароль повинен містити мінімум 6 символів/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls login with correct parameters', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', false)
      })
    })

    it('includes rememberMe when checkbox is checked', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      const rememberMeCheckbox = screen.getByRole('checkbox', { name: /запам.*ятати мене/i })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')
      await user.click(rememberMeCheckbox)

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', true)
      })
    })

    it('navigates to home on successful login', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('loading state', () => {
    it('shows loading text on submit button when loading', () => {
      renderWithProviders(<LoginForm />, {
        authContext: {
          state: createMockAuthState({ isLoading: true }),
        },
      })

      expect(screen.getByRole('button', { name: /вхід\.\.\./i })).toBeInTheDocument()
    })

    it('disables inputs when loading', () => {
      renderWithProviders(<LoginForm />, {
        authContext: {
          state: createMockAuthState({ isLoading: true }),
        },
      })

      expect(getEmailInput()).toBeDisabled()
      expect(getPasswordInput()).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: /запам.*ятати мене/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /вхід\.\.\./i })).toBeDisabled()
    })

    it('disables social login buttons when loading', () => {
      renderWithProviders(<LoginForm />, {
        authContext: {
          state: createMockAuthState({ isLoading: true }),
        },
      })

      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /github/i })).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('displays general error message on login failure', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue({ message: 'Invalid credentials', status: 401 })

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Невірна електронна пошта або пароль.')).toBeInTheDocument()
      })
    })

    it('displays fallback error message when error has no message', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue(new Error())

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/помилка входу/i)).toBeInTheDocument()
      })
    })

    it('clears previous errors on new submission', async () => {
      const user = userEvent.setup()
      const mockLogin = vi
        .fn()
        .mockRejectedValueOnce({ message: 'Server error', status: 500 })
        .mockResolvedValueOnce(undefined)

      renderWithProviders(<LoginForm />, {
        authContext: {
          login: mockLogin,
          state: createMockAuthState(),
        },
      })

      const submitButton = screen.getByRole('button', { name: /^увійти$/i })

      await user.type(getEmailInput(), 'test@example.com')
      await user.type(getPasswordInput(), 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Помилка сервера. Спробуйте пізніше.')).toBeInTheDocument()
      })

      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Помилка сервера. Спробуйте пізніше.')).not.toBeInTheDocument()
      })
    })
  })

  describe('password visibility toggle', () => {
    it('toggles password visibility when button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<LoginForm />)

      const passwordInput = getPasswordInput()
      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = screen.getByRole('button', { name: /показати пароль/i })
      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute('type', 'text')

      const hideButton = screen.getByRole('button', { name: /приховати пароль/i })
      await user.click(hideButton)

      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })
})

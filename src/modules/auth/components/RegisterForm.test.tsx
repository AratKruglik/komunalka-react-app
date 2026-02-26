import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterForm } from './RegisterForm'
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

vi.mock('@shared/components/ui', async () => {
  const actual = await vi.importActual('@shared/components/ui')
  return {
    ...actual,
    PasswordInput: ({
      id,
      label,
      value,
      onChange,
      disabled,
      error,
    }: {
      id: string
      label: React.ReactNode
      value: string
      onChange: (value: string) => void
      disabled?: boolean
      error?: string
    }) => (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {error && <p className="text-red-500">{error}</p>}
      </div>
    ),
    getPasswordStrength: (password: string) => {
      if (!password) return 'none'
      if (password.length < 6) return 'weak'
      if (password.length < 10) return 'medium'
      return 'strong'
    },
    defaultPasswordRequirements: [],
  }
})

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/ім.*я/i), 'John')
  await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
  await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
  await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
  await user.type(screen.getByLabelText(/^пароль/i), 'StrongPassword123!')
  await user.type(screen.getByLabelText(/підтвердити пароль/i), 'StrongPassword123!')

  const checkboxes = screen.getAllByRole('checkbox')
  for (const checkbox of checkboxes) {
    const label = checkbox.closest('label')?.textContent || ''
    if (label.includes('умовами') || label.includes('політикою')) {
      await user.click(checkbox)
    }
  }
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all required fields', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByLabelText(/ім.*я/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/прізвище/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/електронна пошта/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/номер телефону/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^пароль/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/підтвердити пароль/i)).toBeInTheDocument()
    })

    it('renders language selector', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByLabelText(/мова інтерфейсу/i)).toBeInTheDocument()
    })

    it('renders agreement checkboxes', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByText(/умовами використання/i)).toBeInTheDocument()
      expect(screen.getByText(/політикою конфіденційності/i)).toBeInTheDocument()
    })

    it('renders social login buttons', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByRole('button', { name: /створити акаунт/i })).toBeInTheDocument()
    })

    it('renders login link for existing users', () => {
      renderWithProviders(<RegisterForm />)

      expect(screen.getByRole('link', { name: /увійти/i })).toBeInTheDocument()
    })
  })

  describe('field validation', () => {
    it('shows error when first name is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/ім.*я обов.*язкове/i)).toBeInTheDocument()
      })
    })

    it('shows error when last name is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/прізвище обов.*язкове/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'test@invalid')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/невірний формат електронної пошти/i)).toBeInTheDocument()
      })
    })

    it('shows error for invalid phone number', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '123')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/введіть коректний номер телефону/i)).toBeInTheDocument()
      })
    })
  })

  describe('password validation', () => {
    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/пароль обов.*язковий/i)).toBeInTheDocument()
      })
    })

    it('shows error when password is too weak', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
      await user.type(screen.getByLabelText(/^пароль/i), '12345')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/пароль занадто слабкий/i)).toBeInTheDocument()
      })
    })
  })

  describe('password match validation', () => {
    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
      await user.type(screen.getByLabelText(/^пароль/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/підтвердити пароль/i), 'DifferentPassword456!')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/паролі не співпадають/i)).toBeInTheDocument()
      })
    })

    it('shows error when confirm password is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
      await user.type(screen.getByLabelText(/^пароль/i), 'StrongPassword123!')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/підтвердження паролю обов.*язкове/i)).toBeInTheDocument()
      })
    })
  })

  describe('terms checkbox validation', () => {
    it('shows error when terms checkbox is not checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
      await user.type(screen.getByLabelText(/^пароль/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/підтвердити пароль/i), 'StrongPassword123!')

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/необхідно погодитися з умовами використання/i)).toBeInTheDocument()
      })
    })

    it('shows error when privacy checkbox is not checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<RegisterForm />)

      await user.type(screen.getByLabelText(/ім.*я/i), 'John')
      await user.type(screen.getByLabelText(/прізвище/i), 'Doe')
      await user.type(screen.getByLabelText(/електронна пошта/i), 'john@example.com')
      await user.type(screen.getByLabelText(/номер телефону/i), '501234567')
      await user.type(screen.getByLabelText(/^пароль/i), 'StrongPassword123!')
      await user.type(screen.getByLabelText(/підтвердити пароль/i), 'StrongPassword123!')

      const checkboxes = screen.getAllByRole('checkbox')
      for (const checkbox of checkboxes) {
        const label = checkbox.closest('label')?.textContent || ''
        if (label.includes('умовами')) {
          await user.click(checkbox)
        }
      }

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/необхідно погодитися з політикою конфіденційності/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls register with correct parameters', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<RegisterForm />, {
        authContext: {
          register: mockRegister,
          state: createMockAuthState(),
        },
      })

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phoneNumber: '+380501234567',
            password: 'StrongPassword123!',
            passwordConfirmation: 'StrongPassword123!',
          }),
          true
        )
      })
    })

    it('navigates to home on successful registration', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockResolvedValue(undefined)

      renderWithProviders(<RegisterForm />, {
        authContext: {
          register: mockRegister,
          state: createMockAuthState(),
        },
      })

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('loading state', () => {
    it('disables inputs when loading', () => {
      renderWithProviders(<RegisterForm />, {
        authContext: {
          state: createMockAuthState({ isLoading: true }),
        },
      })

      expect(screen.getByLabelText(/ім.*я/i)).toBeDisabled()
      expect(screen.getByLabelText(/прізвище/i)).toBeDisabled()
      expect(screen.getByLabelText(/електронна пошта/i)).toBeDisabled()
      expect(screen.getByLabelText(/номер телефону/i)).toBeDisabled()
    })

    it('disables social login buttons when loading', () => {
      renderWithProviders(<RegisterForm />, {
        authContext: {
          state: createMockAuthState({ isLoading: true }),
        },
      })

      expect(screen.getByRole('button', { name: /google/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /github/i })).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('displays general error message on registration failure', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockRejectedValue({ message: 'Email already exists' })

      renderWithProviders(<RegisterForm />, {
        authContext: {
          register: mockRegister,
          state: createMockAuthState(),
        },
      })

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })

    it('displays fallback error message when error has no message', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockRejectedValue(new Error())

      renderWithProviders(<RegisterForm />, {
        authContext: {
          register: mockRegister,
          state: createMockAuthState(),
        },
      })

      await fillValidForm(user)

      const submitButton = screen.getByRole('button', { name: /створити акаунт/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/помилка реєстрації/i)).toBeInTheDocument()
      })
    })
  })
})

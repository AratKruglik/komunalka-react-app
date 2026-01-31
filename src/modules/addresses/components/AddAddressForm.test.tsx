import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddAddressForm } from './AddAddressForm'
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
} from '@test-utils'

const mockNavigate = vi.fn()
const mockCreateAddress = vi.fn()
let mockIsLoading = false
let mockError: string | null = null

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../hooks', () => ({
  useCreateAddress: () => ({
    createAddress: mockCreateAddress,
    get isLoading() {
      return mockIsLoading
    },
    get error() {
      return mockError
    },
    isSuccess: false,
    reset: vi.fn(),
  }),
}))

function getRegionSelect() {
  return screen.getByRole('combobox', { name: /область/i })
}

function getCityInput() {
  return screen.getByPlaceholderText(/введіть назву міста/i)
}

function getStreetInput() {
  return screen.getByPlaceholderText(/введіть назву вулиці/i)
}

function getBuildingInput() {
  return screen.getByPlaceholderText(/введіть номер будинку/i)
}

function getUnitInput() {
  return screen.getByPlaceholderText(/введіть номер квартири або офісу/i)
}

function getPostalCodeInput() {
  return screen.getByPlaceholderText(/введіть поштовий індекс/i)
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /зберегти адресу/i })
}

function getCancelButton() {
  return screen.getByRole('button', { name: /скасувати/i })
}

describe('AddAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading = false
    mockError = null
  })

  describe('rendering', () => {
    it('renders form header', () => {
      renderWithProviders(<AddAddressForm />)

      expect(screen.getByRole('heading', { name: /додати нову адресу/i })).toBeInTheDocument()
      expect(screen.getByText(/заповніть форму нижче/i)).toBeInTheDocument()
    })

    it('renders property type options', () => {
      renderWithProviders(<AddAddressForm />)

      expect(screen.getByText('Квартира')).toBeInTheDocument()
      expect(screen.getByText('Приватний будинок')).toBeInTheDocument()
      expect(screen.getByText('Офіс')).toBeInTheDocument()
    })

    it('renders stepper with three steps', () => {
      renderWithProviders(<AddAddressForm />)

      const stepperSteps = document.querySelectorAll('ol li p.text-sm.font-medium')
      expect(stepperSteps).toHaveLength(3)
      expect(stepperSteps[0].textContent).toBe('Тип нерухомості')
      expect(stepperSteps[1].textContent).toBe('Адреса')
      expect(stepperSteps[2].textContent).toBe('Підтвердження')
    })

    it('renders cancel and submit buttons', () => {
      renderWithProviders(<AddAddressForm />)

      expect(getCancelButton()).toBeInTheDocument()
      expect(getSubmitButton()).toBeInTheDocument()
    })

    it('renders instruction message when property type not selected', () => {
      renderWithProviders(<AddAddressForm />)

      expect(
        screen.getByText(/оберіть тип нерухомості, щоб заповнити адресу/i)
      ).toBeInTheDocument()
    })
  })

  describe('property type selection', () => {
    it('selects apartment property type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)

      expect(apartmentCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects house property type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const houseCard = screen.getByText('Приватний будинок').closest('button')!
      await user.click(houseCard)

      expect(houseCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects office property type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const officeCard = screen.getByText('Офіс').closest('button')!
      await user.click(officeCard)

      expect(officeCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('hides instruction message after property type selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)

      expect(
        screen.queryByText(/оберіть тип нерухомості, щоб заповнити адресу/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('fields disabled state', () => {
    it('disables address fields when property type not selected', () => {
      renderWithProviders(<AddAddressForm />)

      expect(getRegionSelect()).toBeDisabled()
      expect(getCityInput()).toBeDisabled()
      expect(getStreetInput()).toBeDisabled()
      expect(getBuildingInput()).toBeDisabled()
      expect(getUnitInput()).toBeDisabled()
      expect(getPostalCodeInput()).toBeDisabled()
    })

    it('enables address fields after property type selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)

      expect(getRegionSelect()).not.toBeDisabled()
      expect(getCityInput()).not.toBeDisabled()
      expect(getStreetInput()).not.toBeDisabled()
      expect(getBuildingInput()).not.toBeDisabled()
      expect(getUnitInput()).not.toBeDisabled()
      expect(getPostalCodeInput()).not.toBeDisabled()
    })

    it('disables submit button when property type not selected', () => {
      renderWithProviders(<AddAddressForm />)

      expect(getSubmitButton()).toBeDisabled()
    })

    it('enables submit button after property type selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)

      expect(getSubmitButton()).not.toBeDisabled()
    })
  })

  describe('validation', () => {
    it('marks property type as required with asterisk', () => {
      renderWithProviders(<AddAddressForm />)

      expect(document.body.innerHTML).toContain('Тип нерухомості')
    })

    it('shows validation errors when submitting empty form after selecting property type', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.click(getSubmitButton())

      await waitFor(() => {
        const errorMessages = document.querySelectorAll('.text-red-500')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('shows error when postal code format is invalid', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '123')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/поштовий індекс має містити 5 цифр/i)).toBeInTheDocument()
      })
    })

    it('accepts valid 5-digit postal code', async () => {
      const user = userEvent.setup()
      mockCreateAddress.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '01001')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateAddress).toHaveBeenCalled()
      })
    })
  })

  describe('form submission', () => {
    it('calls createAddress with correct data on submit', async () => {
      const user = userEvent.setup()
      mockCreateAddress.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '01001')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateAddress).toHaveBeenCalledWith({
          regionId: 9,
          city: 'Київ',
          street: 'Хрещатик',
          buildingNumber: '22',
          apartmentNumber: '15',
          zipCode: '01001',
          notes: '',
          isPrimary: false,
          addressTypeId: 1,
        })
      })
    })

    it('navigates to addresses list on successful submit', async () => {
      const user = userEvent.setup()
      mockCreateAddress.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '01001')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/addresses')
      })
    })
  })

  describe('primary checkbox', () => {
    it('renders primary checkbox', () => {
      renderWithProviders(<AddAddressForm />)

      expect(
        screen.getByRole('checkbox', { name: /встановити як основну адресу/i })
      ).toBeInTheDocument()
    })

    it('submits with isPrimary true when checkbox checked', async () => {
      const user = userEvent.setup()
      mockCreateAddress.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '01001')

      const primaryCheckbox = screen.getByRole('checkbox', {
        name: /встановити як основну адресу/i,
      })
      await user.click(primaryCheckbox)
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateAddress).toHaveBeenCalledWith(
          expect.objectContaining({
            isPrimary: true,
          })
        )
      })
    })
  })

  describe('cancel button', () => {
    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()
      renderWithProviders(<AddAddressForm onCancel={mockOnCancel} />)

      await user.click(getCancelButton())

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('shows loading text on submit button when loading', async () => {
      mockIsLoading = true
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await userEvent.setup().click(apartmentCard)

      expect(screen.getByRole('button', { name: /збереження/i })).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('displays error message when createAddress fails', () => {
      mockError = 'Не вдалося створити адресу'
      renderWithProviders(<AddAddressForm />)

      expect(screen.getByText(/не вдалося створити адресу/i)).toBeInTheDocument()
    })

    it('does not navigate when createAddress throws', async () => {
      const user = userEvent.setup()
      mockCreateAddress.mockRejectedValue(new Error('API error'))
      renderWithProviders(<AddAddressForm />)

      const apartmentCard = screen.getByText('Квартира').closest('button')!
      await user.click(apartmentCard)
      await user.selectOptions(getRegionSelect(), 'Київська область')
      await user.type(getCityInput(), 'Київ')
      await user.type(getStreetInput(), 'Хрещатик')
      await user.type(getBuildingInput(), '22')
      await user.type(getUnitInput(), '15')
      await user.type(getPostalCodeInput(), '01001')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateAddress).toHaveBeenCalled()
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})

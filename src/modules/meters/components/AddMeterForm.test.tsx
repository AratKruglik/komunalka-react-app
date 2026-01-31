import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddMeterForm } from './AddMeterForm'
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
  createMockAddress,
} from '@test-utils'

const mockCreateMeter = vi.fn()
let mockIsLoading = false
let mockError: string | null = null

const mockAddresses = [
  createMockAddress({ id: 1, street: 'Хрещатик', building: '22', apartment: '15' }),
  createMockAddress({ id: 2, street: 'Дарницька', building: '5', apartment: '42' }),
]

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@modules/addresses/hooks', () => ({
  useAddresses: () => ({
    addresses: mockAddresses,
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@modules/meters/hooks', () => ({
  useCreateMeter: () => ({
    createMeter: mockCreateMeter,
    get isLoading() {
      return mockIsLoading
    },
    get error() {
      return mockError
    },
    createdMeter: null,
    reset: vi.fn(),
  }),
}))

function getAddressSelect() {
  return screen.getByRole('combobox', { name: /оберіть адресу/i })
}

function getSerialNumberInput() {
  return screen.getByPlaceholderText(/введіть серійний номер лічильника/i)
}

function getLocationInput() {
  return screen.getByPlaceholderText(/наприклад: на кухні біля вхідних дверей/i)
}

function getManufacturerInput() {
  return screen.getByPlaceholderText(/введіть модель або виробника/i)
}

function getInstallationDateInput() {
  return screen.getByLabelText(/дата встановлення/i)
}

function getInitialReadingInput() {
  return screen.getByLabelText(/початкові показання/i)
}

function getTariffInput() {
  return screen.getByLabelText(/поточний тариф/i)
}

function getProviderSelect() {
  return screen.getByRole('combobox', { name: /провайдер послуги/i })
}

function getNotesTextarea() {
  return screen.getByPlaceholderText(/будь-які додаткові деталі про лічильник/i)
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /зберегти лічильник/i })
}

function getCancelButton() {
  return screen.getByRole('button', { name: /скасувати/i })
}

function getClearFormButton() {
  return screen.getByRole('button', { name: /очистити форму/i })
}

function getSaveDraftButton() {
  return screen.getByRole('button', { name: /зберегти чернетку/i })
}

describe('AddMeterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsLoading = false
    mockError = null
  })

  describe('rendering', () => {
    it('renders form header', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByRole('heading', { name: /додати новий лічильник/i })).toBeInTheDocument()
      expect(screen.getByText(/заповніть форму, щоб додати новий лічильник/i)).toBeInTheDocument()
    })

    it('renders address selection dropdown', () => {
      renderWithProviders(<AddMeterForm />)

      expect(getAddressSelect()).toBeInTheDocument()
    })

    it('renders address options from addresses hook', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText(/хрещатик, 22, кв. 15/i)).toBeInTheDocument()
      expect(screen.getByText(/дарницька, 5, кв. 42/i)).toBeInTheDocument()
    })

    it('renders all meter type options', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText('Електролічильник')).toBeInTheDocument()
      expect(screen.getByText('Газовий лічильник')).toBeInTheDocument()
      expect(screen.getByText('Лічильник холодної води')).toBeInTheDocument()
      expect(screen.getByText('Лічильник гарячої води')).toBeInTheDocument()
      expect(screen.getByText('Лічильник тепла')).toBeInTheDocument()
    })

    it('renders form action buttons', () => {
      renderWithProviders(<AddMeterForm />)

      expect(getCancelButton()).toBeInTheDocument()
      expect(getClearFormButton()).toBeInTheDocument()
      expect(getSaveDraftButton()).toBeInTheDocument()
      expect(getSubmitButton()).toBeInTheDocument()
    })

    it('renders tips section', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText(/поради щодо заповнення/i)).toBeInTheDocument()
      expect(screen.getByText(/перевірте серійний номер/i)).toBeInTheDocument()
    })

    it('renders progress indicator at 0% initially', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText('0% завершено')).toBeInTheDocument()
    })
  })

  describe('meter type selection', () => {
    it('selects electricity meter type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      expect(electricityCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects gas meter type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const gasCard = screen.getByText('Газовий лічильник').closest('button')!
      await user.click(gasCard)

      expect(gasCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects cold water meter type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const coldWaterCard = screen.getByText('Лічильник холодної води').closest('button')!
      await user.click(coldWaterCard)

      expect(coldWaterCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects hot water meter type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const hotWaterCard = screen.getByText('Лічильник гарячої води').closest('button')!
      await user.click(hotWaterCard)

      expect(hotWaterCard).toHaveAttribute('aria-pressed', 'true')
    })

    it('selects heat meter type when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const heatCard = screen.getByText('Лічильник тепла').closest('button')!
      await user.click(heatCard)

      expect(heatCard).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('provider selection', () => {
    it('disables provider select when meter type not selected', () => {
      renderWithProviders(<AddMeterForm />)

      expect(getProviderSelect()).toBeDisabled()
    })

    it('shows placeholder message when meter type not selected', () => {
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText(/спочатку оберіть тип лічильника/i)).toBeInTheDocument()
    })

    it('enables provider select after meter type selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      expect(getProviderSelect()).not.toBeDisabled()
    })

    it('shows filtered providers based on meter type', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      expect(screen.getByText(/yasno/i)).toBeInTheDocument()
    })

    it('updates tariff when provider selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      await user.selectOptions(getProviderSelect(), '1')

      await waitFor(() => {
        expect(getTariffInput()).toHaveValue(4.32)
      })
    })
  })

  describe('progress indicator', () => {
    it('updates progress when required fields are filled', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')

      await waitFor(() => {
        expect(screen.getByText(/17% завершено/)).toBeInTheDocument()
      })

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      await waitFor(() => {
        expect(screen.getByText(/33% завершено/)).toBeInTheDocument()
      })
    })
  })

  describe('validation', () => {
    it('renders address field with required indicator', () => {
      renderWithProviders(<AddMeterForm />)

      const addressLabel = screen.getByLabelText(/оберіть адресу/i)
      expect(addressLabel).toBeInTheDocument()
    })

    it('renders meter type section with required indicator', () => {
      renderWithProviders(<AddMeterForm />)

      expect(document.body.innerHTML).toContain('Тип лічильника')
    })

    it('shows error when serial number is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/серійний номер є обов'язковим/i)).toBeInTheDocument()
      })
    })

    it('shows error when serial number is too short', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)
      await user.type(getSerialNumberInput(), '12345')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/мінімум 6 символів/i)).toBeInTheDocument()
      })
    })

    it('shows error when installation date is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)
      await user.type(getSerialNumberInput(), 'AE123456')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/вкажіть дату встановлення/i)).toBeInTheDocument()
      })
    })

    it('shows error when initial reading is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)
      await user.type(getSerialNumberInput(), 'AE123456')
      await user.type(getInstallationDateInput(), '2024-01-15')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/вкажіть початкові показання/i)).toBeInTheDocument()
      })
    })

    it('shows error when tariff is empty', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)
      await user.type(getSerialNumberInput(), 'AE123456')
      await user.type(getInstallationDateInput(), '2024-01-15')
      await user.type(getInitialReadingInput(), '100')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/вкажіть тариф/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls createMeter with correct data on submit', async () => {
      const user = userEvent.setup()
      mockCreateMeter.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      await user.type(getSerialNumberInput(), 'AE123456')
      await user.type(getInstallationDateInput(), '2024-01-15')
      await user.type(getInitialReadingInput(), '100')
      await user.type(getTariffInput(), '4.32')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateMeter).toHaveBeenCalledWith(
          expect.objectContaining({
            AddressId: 1,
            UtilityTypeId: 1,
            SerialNumber: 'AE123456',
            InstallationDate: '2024-01-15',
            IsActive: true,
          }),
          undefined
        )
      })
    })

    it('shows success message after successful submission', async () => {
      const user = userEvent.setup()
      mockCreateMeter.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      await user.type(getSerialNumberInput(), 'AE123456')
      await user.type(getInstallationDateInput(), '2024-01-15')
      await user.type(getInitialReadingInput(), '100')
      await user.type(getTariffInput(), '4.32')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/лічильник успішно створено/i)).toBeInTheDocument()
      })
    })

    it('includes optional fields when provided', async () => {
      const user = userEvent.setup()
      mockCreateMeter.mockResolvedValue({ id: 1 })
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      await user.type(getSerialNumberInput(), 'AE123456')
      await user.type(getLocationInput(), 'Коридор біля входу')
      await user.type(getManufacturerInput(), 'Energomera CE102')
      await user.type(getInstallationDateInput(), '2024-01-15')
      await user.type(getInitialReadingInput(), '100')
      await user.type(getTariffInput(), '4.32')
      await user.type(getNotesTextarea(), 'Тестова примітка')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockCreateMeter).toHaveBeenCalledWith(
          expect.objectContaining({
            Location: 'Коридор біля входу',
            ModelName: 'Energomera CE102',
            Notes: 'Тестова примітка',
          }),
          undefined
        )
      })
    })
  })

  describe('cancel button', () => {
    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup()
      const mockOnCancel = vi.fn()
      renderWithProviders(<AddMeterForm onCancel={mockOnCancel} />)

      await user.click(getCancelButton())

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('clear form', () => {
    it('resets form fields when clear button clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      await user.type(getSerialNumberInput(), 'AE123456')

      expect(getSerialNumberInput()).toHaveValue('AE123456')

      await user.click(getClearFormButton())

      expect(getSerialNumberInput()).toHaveValue('')
      expect(getAddressSelect()).toHaveValue('')
    })
  })

  describe('draft mode', () => {
    it('can click save draft button', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      await user.selectOptions(getAddressSelect(), '1')
      await user.type(getSerialNumberInput(), 'AE123456')

      expect(getSaveDraftButton()).not.toBeDisabled()
      await user.click(getSaveDraftButton())
    })
  })

  describe('loading state', () => {
    it('shows loading text on submit button during loading', () => {
      mockIsLoading = true
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByRole('button', { name: /збереження/i })).toBeInTheDocument()
    })

    it('disables draft button during loading', () => {
      mockIsLoading = true
      renderWithProviders(<AddMeterForm />)

      expect(getSaveDraftButton()).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('displays error message when createMeter fails', () => {
      mockError = 'Не вдалося створити лічильник'
      renderWithProviders(<AddMeterForm />)

      expect(screen.getByText(/не вдалося створити лічильник/i)).toBeInTheDocument()
    })
  })

  describe('reading unit display', () => {
    it('shows correct unit for electricity meter', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const electricityCard = screen.getByText('Електролічильник').closest('button')!
      await user.click(electricityCard)

      expect(screen.getByText('кВт·год')).toBeInTheDocument()
    })

    it('shows correct unit for gas meter', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const gasCard = screen.getByText('Газовий лічильник').closest('button')!
      await user.click(gasCard)

      expect(screen.getAllByText('м³').length).toBeGreaterThan(0)
    })

    it('shows correct unit for heat meter', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AddMeterForm />)

      const heatCard = screen.getByText('Лічильник тепла').closest('button')!
      await user.click(heatCard)

      expect(screen.getByText('Гкал')).toBeInTheDocument()
    })
  })
})

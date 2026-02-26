import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import {
  renderWithProviders,
  screen,
  waitFor,
  userEvent,
  createAuthenticatedState,
  createMockAddress,
  createMockMeter,
  createMockReading,
} from '@test-utils'
import AddReadingsPage from './AddReadingsPage'
import { useAddresses } from '@modules/addresses/hooks'
import { useMetersByAddress } from '@modules/meters/hooks'
import { useReadingsByAddress, useCreateBatchReadings } from '@modules/readings/hooks'
import { useServiceProvidersByAddress } from '@modules/providers/hooks'
import type { Address, Meter, Reading } from '@shared/types/entities'
import type { ApiServiceProvider } from '@shared/types/api'

vi.mock('@modules/addresses/hooks', () => ({
  useAddresses: vi.fn(),
}))

vi.mock('@modules/meters/hooks', () => ({
  useMetersByAddress: vi.fn(),
}))

vi.mock('@modules/readings/hooks', () => ({
  useReadingsByAddress: vi.fn(),
  useCreateBatchReadings: vi.fn(),
}))

vi.mock('@modules/providers/hooks', () => ({
  useServiceProvidersByAddress: vi.fn(),
}))

const electricityUtilityType = {
  id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год',
  description: 'Електроенергія', isActive: true,
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
}

const gasUtilityType = {
  id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³',
  description: 'Газ', isActive: true,
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
}

const uahCurrency = {
  id: 1, code: 'UAH', name: 'Українська гривня', symbol: '₴',
  createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
}

const baseTariffFields = {
  serviceFee: 0,
  effectiveFrom: '2024-01-01T00:00:00Z',
  effectiveTo: null,
  notes: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  currency: uahCurrency,
}

const baseProviderFields = {
  addressId: 1,
  description: null,
  phone: null,
  email: null,
  website: null,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockApiProviders: ApiServiceProvider[] = [
  {
    id: 1,
    name: 'YASNO',
    ...baseProviderFields,
    utilityType: electricityUtilityType,
    tariffs: [
      {
        id: 7,
        name: 'День',
        baseRate: 2.64,
        ...baseTariffFields,
        utilityType: electricityUtilityType,
      },
      {
        id: 8,
        name: 'Ніч',
        baseRate: 1.32,
        ...baseTariffFields,
        utilityType: electricityUtilityType,
      },
    ],
  },
  {
    id: 2,
    name: 'Київгаз',
    ...baseProviderFields,
    utilityType: gasUtilityType,
    tariffs: [
      {
        id: 2,
        name: 'Газ',
        baseRate: 7.96,
        ...baseTariffFields,
        utilityType: gasUtilityType,
      },
    ],
  },
]

const mockNavigate = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockAddresses: Address[] = [
  createMockAddress({
    id: 1,
    street: 'вул. Хрещатик',
    buildingNumber: '22',
    apartmentNumber: '15',
    city: 'Київ',
    isPrimary: true,
  }),
  createMockAddress({
    id: 2,
    street: 'вул. Дарницька',
    buildingNumber: '5',
    apartmentNumber: '42',
    city: 'Київ',
    isPrimary: false,
  }),
]

const mockMeters: Meter[] = [
  createMockMeter({
    id: 100,
    addressId: 1,
    serviceProvider: { id: 1, name: 'YASNO' },
    utilityType: { id: 2, slug: 'electricity', displayName: 'Електроенергія', unit: 'кВт·год' },
    name: 'Основний тариф',
    serialNumber: 'EL-238923',
    isActive: true,
  }),
  createMockMeter({
    id: 101,
    addressId: 1,
    serviceProvider: { id: 2, name: 'Київгаз' },
    utilityType: { id: 1, slug: 'gas', displayName: 'Газ', unit: 'м³' },
    name: 'Плита на кухні',
    serialNumber: 'GS-88342',
    isActive: true,
  }),
]

const mockReadings: Reading[] = [
  createMockReading({
    id: 1,
    meter: { id: 100, serialNumber: 'EL-238923' },
    readingValue: 1500,
    consumption: 150,
    readingDate: '2025-01-15',
    tariff: { id: 7, name: 'День' },
  }),
  createMockReading({
    id: 3,
    meter: { id: 100, serialNumber: 'EL-238923' },
    readingValue: 800,
    consumption: 80,
    readingDate: '2025-01-15',
    tariff: { id: 8, name: 'Ніч' },
  }),
  createMockReading({
    id: 2,
    meter: { id: 101, serialNumber: 'GS-88342' },
    readingValue: 350,
    consumption: 25,
    readingDate: '2025-01-15',
    tariff: { id: 2, name: 'Газ' },
  }),
]

function setupDefaultMocks(overrides: {
  addresses?: Address[]
  meters?: Meter[]
  readings?: Reading[]
  providers?: ApiServiceProvider[]
  isLoadingAddresses?: boolean
  isLoadingMeters?: boolean
  isLoadingReadings?: boolean
  isLoadingProviders?: boolean
  isSubmitting?: boolean
  submitError?: string | null
} = {}) {
  const {
    addresses = mockAddresses,
    meters = mockMeters,
    readings = mockReadings,
    providers = mockApiProviders,
    isLoadingAddresses = false,
    isLoadingMeters = false,
    isLoadingReadings = false,
    isLoadingProviders = false,
    isSubmitting = false,
    submitError = null,
  } = overrides

  const mockCreateBatchReadings = vi.fn().mockResolvedValue(readings)
  const mockRefetchReadings = vi.fn()
  const mockRefetchProviders = vi.fn()

  vi.mocked(useAddresses).mockReturnValue({
    addresses,
    pagination: null,
    isLoading: isLoadingAddresses,
    error: null,
    fetchAddresses: vi.fn(),
    refetch: vi.fn(),
  })

  vi.mocked(useMetersByAddress).mockReturnValue({
    meters,
    isLoading: isLoadingMeters,
    error: null,
    refetch: vi.fn(),
  })

  vi.mocked(useReadingsByAddress).mockReturnValue({
    readings,
    isLoading: isLoadingReadings,
    error: null,
    refetch: mockRefetchReadings,
  })

  vi.mocked(useServiceProvidersByAddress).mockReturnValue({
    providers,
    isLoading: isLoadingProviders,
    error: null,
    refetch: mockRefetchProviders,
  })

  vi.mocked(useCreateBatchReadings).mockReturnValue({
    createBatchReadings: mockCreateBatchReadings,
    isLoading: isSubmitting,
    error: submitError,
    createdReadings: null,
    reset: vi.fn(),
  })

  return {
    mockCreateBatchReadings,
    mockRefetchReadings,
    mockRefetchProviders,
  }
}

describe('AddReadingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders page with address selector', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('heading', { name: 'Внести показання' })).toBeInTheDocument()
      expect(screen.getByText('Оберіть адресу для внесення показань')).toBeInTheDocument()
      expect(screen.getByLabelText('Адреса')).toBeInTheDocument()
    })

    it('renders address options in dropdown', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const select = screen.getByLabelText('Адреса')
      expect(select).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText(/вул\. Хрещатик/)).toBeInTheDocument()
      })
    })

    it('renders meter cards for each meter', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      expect(screen.getAllByText('Газ').length).toBeGreaterThan(0)
    })

    it('renders add meter button', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /додати лічильник/i })).toBeInTheDocument()
    })

    it('renders submit button', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /зберегти/i })).toBeInTheDocument()
    })
  })

  describe('loading states', () => {
    it('shows loading state when fetching meters', async () => {
      setupDefaultMocks({ isLoadingMeters: true })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const submitButton = screen.getByRole('button', { name: /зберегти/i })
      expect(submitButton).toBeDisabled()
    })

    it('shows loading state when fetching readings', async () => {
      setupDefaultMocks({ isLoadingReadings: true })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const submitButton = screen.getByRole('button', { name: /зберегти/i })
      expect(submitButton).toBeDisabled()
    })

    it('shows loading text on submit button when submitting', async () => {
      setupDefaultMocks({ isSubmitting: true })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      expect(screen.getByRole('button', { name: /збереження\.\.\./i })).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no meters for selected address', async () => {
      setupDefaultMocks({ meters: [] })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getByText(/немає лічильників для вибраної адреси/i)).toBeInTheDocument()
      })
    })

    it('shows instruction to add meters when empty', async () => {
      setupDefaultMocks({ meters: [] })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getByText(/додайте лічильник/i)).toBeInTheDocument()
      })
    })

    it('disables submit button when no meters', async () => {
      setupDefaultMocks({ meters: [] })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const submitButton = screen.getByRole('button', { name: /зберегти/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('address switching', () => {
    it('calls useMetersByAddress with selected address ID', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(useMetersByAddress).toHaveBeenCalledWith(1)
      })
    })

    it('loads meters for different address when address changes', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const select = screen.getByLabelText('Адреса')
      await user.selectOptions(select, '2')

      await waitFor(() => {
        expect(useMetersByAddress).toHaveBeenCalledWith(2)
      })
    })
  })

  describe('consumption calculation', () => {
    it('displays previous reading value', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        const inputs = screen.getAllByDisplayValue('1500')
        expect(inputs.length).toBeGreaterThan(0)
      })
    })

    it('calculates consumption when current value is entered', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const currentInputs = screen.getAllByLabelText(/поточні показання/i)
      await user.clear(currentInputs[0])
      await user.type(currentInputs[0], '1600')

      await waitFor(() => {
        expect(screen.getAllByText(/100/).length).toBeGreaterThan(0)
      })
    })
  })

  describe('batch submit', () => {
    it('calls createBatchReadings on form submit', async () => {
      const user = userEvent.setup()
      const { mockCreateBatchReadings } = setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const submitButton = screen.getByRole('button', { name: /^зберегти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBatchReadings).toHaveBeenCalled()
      })
    })

    it('calls createBatchReadings with correct addressId', async () => {
      const user = userEvent.setup()
      const { mockCreateBatchReadings } = setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const submitButton = screen.getByRole('button', { name: /^зберегти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBatchReadings).toHaveBeenCalled()
        const firstCall = mockCreateBatchReadings.mock.calls[0]
        expect(firstCall[0]).toBe(1)
        expect(Array.isArray(firstCall[1])).toBe(true)
      })
    })

    it('shows success message after successful submit', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const submitButton = screen.getByRole('button', { name: /^зберегти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/показання успішно збережено/i)).toBeInTheDocument()
      })
    })

    it('refetches readings after successful submit', async () => {
      const user = userEvent.setup()
      const { mockRefetchReadings } = setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const submitButton = screen.getByRole('button', { name: /^зберегти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRefetchReadings).toHaveBeenCalled()
      })
    })

    it('submits multiple batch items for multi-tariff meters', async () => {
      const user = userEvent.setup()
      const { mockCreateBatchReadings } = setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const submitButton = screen.getByRole('button', { name: /^зберегти$/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBatchReadings).toHaveBeenCalled()
        const batchItems = mockCreateBatchReadings.mock.calls[0][1]
        const electricityItems = batchItems.filter((item: { meterId: number }) => item.meterId === 100)
        expect(electricityItems.length).toBe(2)
        expect(electricityItems[0].tariffId).toBe(7)
        expect(electricityItems[1].tariffId).toBe(8)
      })
    })

    it('filters out readings with zero value from batch', async () => {
      // TODO(human): Implement zero-value filtering test
    })

    it('displays error message on submit failure', async () => {
      setupDefaultMocks({ submitError: 'Не вдалося зберегти показання' })

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getByText('Не вдалося зберегти показання')).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('navigates to add meter page when clicking add meter button', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      const addMeterButton = screen.getByRole('button', { name: /додати лічильник/i })
      await user.click(addMeterButton)

      expect(mockNavigate).toHaveBeenCalledWith('/meters/new')
    })
  })

  describe('multi-tariff rendering', () => {
    it('renders separate inputs for each tariff zone of a multi-tariff meter', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getByText('День')).toBeInTheDocument()
        expect(screen.getByText('Ніч')).toBeInTheDocument()
      })
    })

    it('does not render tariff labels for single-tariff meters', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Газ').length).toBeGreaterThan(0)
      })

      expect(screen.queryByLabelText(/тариф для розрахунку/i)).not.toBeInTheDocument()
    })

    it('displays per-tariff previous values for multi-tariff meters', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByDisplayValue('1500').length).toBeGreaterThan(0)
        expect(screen.getAllByDisplayValue('800').length).toBeGreaterThan(0)
      })
    })
  })

  describe('date selection', () => {
    it('renders date input for each meter card', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        const dateInputs = screen.getAllByLabelText(/дата зняття показань/i)
        expect(dateInputs.length).toBe(2)
      })
    })

    it('allows changing reading date', async () => {
      const user = userEvent.setup()
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        expect(screen.getAllByText('Електроенергія').length).toBeGreaterThan(0)
      })

      const dateInputs = screen.getAllByLabelText(/дата зняття показань/i)
      await user.clear(dateInputs[0])
      await user.type(dateInputs[0], '2025-01-20')

      expect(dateInputs[0]).toHaveValue('2025-01-20')
    })
  })

  describe('reading summary table', () => {
    it('renders reading summary table', async () => {
      setupDefaultMocks()

      renderWithProviders(<AddReadingsPage />, {
        authContext: { state: createAuthenticatedState() },
      })

      await waitFor(() => {
        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
      })
    })
  })
})

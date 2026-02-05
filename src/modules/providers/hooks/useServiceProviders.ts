import { useState, useEffect, useCallback } from 'react'
import { serviceProviderService } from '@/shared/api'
import type {
  ApiServiceProvider,
  CreateServiceProviderRequest,
  UpdateServiceProviderRequest,
} from '@/shared/types/api'

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Hook for fetching all service providers for current user
 */
export function useServiceProviders() {
  const [providers, setProviders] = useState<ApiServiceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProviders = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await serviceProviderService.getAll()
      setProviders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service providers'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    fetchProviders()
  }, [fetchProviders])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  return {
    providers,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching service providers by address ID
 */
export function useServiceProvidersByAddress(addressId: number | null) {
  const [providers, setProviders] = useState<ApiServiceProvider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProviders = useCallback(async () => {
    if (!addressId) {
      setProviders([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await serviceProviderService.getByAddress(addressId)
      setProviders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch providers'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [addressId])

  const refetch = useCallback(() => {
    fetchProviders()
  }, [fetchProviders])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  return {
    providers,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching a single service provider by ID
 */
export function useServiceProvider(id: number | null) {
  const [provider, setProvider] = useState<ApiServiceProvider | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProvider = useCallback(async () => {
    if (!id) {
      setProvider(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await serviceProviderService.getById(id)
      setProvider(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch provider'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  const refetch = useCallback(() => {
    fetchProvider()
  }, [fetchProvider])

  useEffect(() => {
    fetchProvider()
  }, [fetchProvider])

  return {
    provider,
    isLoading,
    error,
    refetch,
  }
}

// =============================================================================
// Mutation Hooks
// =============================================================================

interface MutationState {
  isLoading: boolean
  error: string | null
}

/**
 * Hook for creating a new service provider
 */
export function useCreateServiceProvider() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const create = useCallback(
    async (data: CreateServiceProviderRequest): Promise<ApiServiceProvider | null> => {
      setState({ isLoading: true, error: null })

      try {
        const result = await serviceProviderService.create(data)
        setState({ isLoading: false, error: null })
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create provider'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null })
  }, [])

  return {
    ...state,
    create,
    reset,
  }
}

/**
 * Hook for updating an existing service provider
 */
export function useUpdateServiceProvider() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const update = useCallback(
    async (id: number, data: UpdateServiceProviderRequest): Promise<ApiServiceProvider | null> => {
      setState({ isLoading: true, error: null })

      try {
        const result = await serviceProviderService.update(id, data)
        setState({ isLoading: false, error: null })
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update provider'
        setState({ isLoading: false, error: errorMessage })
        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null })
  }, [])

  return {
    ...state,
    update,
    reset,
  }
}

/**
 * Hook for deleting a service provider
 */
export function useDeleteServiceProvider() {
  const [state, setState] = useState<MutationState>({
    isLoading: false,
    error: null,
  })

  const deleteProvider = useCallback(async (id: number): Promise<boolean> => {
    setState({ isLoading: true, error: null })

    try {
      await serviceProviderService.delete(id)
      setState({ isLoading: false, error: null })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete provider'
      setState({ isLoading: false, error: errorMessage })
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null })
  }, [])

  return {
    ...state,
    deleteProvider,
    reset,
  }
}

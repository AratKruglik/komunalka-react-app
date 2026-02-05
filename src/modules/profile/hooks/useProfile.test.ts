import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { useProfile } from './useProfile'
import { AuthContext } from '@shared/contexts/auth'
import type { AuthContextValue, AuthState, User } from '@shared/types/auth'

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '+380501234567',
}

function createMockAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    user: mockUser,
    token: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    isAuthenticated: true,
    isLoading: false,
    error: null,
    ...overrides,
  }
}

function createMockAuthContext(
  stateOverrides: Partial<AuthState> = {},
  updateProfileMock?: vi.Mock
): AuthContextValue {
  return {
    state: createMockAuthState(stateOverrides),
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    register: vi.fn().mockResolvedValue(undefined),
    refreshTokenManually: vi.fn().mockResolvedValue(undefined),
    updateProfile: updateProfileMock ?? vi.fn().mockResolvedValue(mockUser),
  }
}

function createWrapper(authContext: AuthContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(AuthContext.Provider, { value: authContext }, children)
  }
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('returns user from auth context', () => {
      const authContext = createMockAuthContext()
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('returns null user when not authenticated', () => {
      const authContext = createMockAuthContext({ user: null, isAuthenticated: false })
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      expect(result.current.user).toBeNull()
    })

    it('has isLoading set to false initially', () => {
      const authContext = createMockAuthContext()
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('has error set to null initially', () => {
      const authContext = createMockAuthContext()
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      expect(result.current.error).toBeNull()
    })

    it('has isSuccess set to false initially', () => {
      const authContext = createMockAuthContext()
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      expect(result.current.isSuccess).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('calls updateProfile from auth context with correct data', async () => {
      const mockUpdateProfile = vi.fn().mockResolvedValue(mockUser)
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        await result.current.updateProfile(updateData)
      })

      expect(mockUpdateProfile).toHaveBeenCalledWith(updateData)
    })

    it('sets isLoading to true during update', async () => {
      let resolvePromise: () => void
      const mockUpdateProfile = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolvePromise = resolve })
      )
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      act(() => {
        result.current.updateProfile(updateData)
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePromise!()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('sets isSuccess to true on successful update', async () => {
      const mockUpdateProfile = vi.fn().mockResolvedValue(mockUser)
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        await result.current.updateProfile(updateData)
      })

      expect(result.current.isSuccess).toBe(true)
    })

    it('sets error on update failure', async () => {
      const errorMessage = 'Update failed'
      const mockUpdateProfile = vi.fn().mockRejectedValue(new Error(errorMessage))
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      let thrownError: Error | undefined
      await act(async () => {
        try {
          await result.current.updateProfile(updateData)
        } catch (err) {
          thrownError = err as Error
        }
      })

      expect(thrownError?.message).toBe(errorMessage)
      expect(result.current.error).toBe(errorMessage)
    })

    it('handles non-Error error objects', async () => {
      const mockUpdateProfile = vi.fn().mockRejectedValue('String error')
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        try {
          await result.current.updateProfile(updateData)
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to update profile')
    })

    // TODO(human): Add test for password change through updateProfile
    // The test should verify that updateProfile correctly handles password fields
    // (currentPassword, newPassword, confirmNewPassword) and sets isSuccess to true

    it('clears previous error on new update attempt', async () => {
      const mockUpdateProfile = vi
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockUser)

      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        try {
          await result.current.updateProfile(updateData)
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('First error')

      await act(async () => {
        await result.current.updateProfile(updateData)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('clearError', () => {
    it('clears error state', async () => {
      const mockUpdateProfile = vi.fn().mockRejectedValue(new Error('Test error'))
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        try {
          await result.current.updateProfile(updateData)
        } catch {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('clears isSuccess state', async () => {
      const mockUpdateProfile = vi.fn().mockResolvedValue(mockUser)
      const authContext = createMockAuthContext({}, mockUpdateProfile)
      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateData = {
        username: 'newusername',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'Name',
        phoneNumber: '+380501234568',
        password: undefined,
      }

      await act(async () => {
        await result.current.updateProfile(updateData)
      })

      expect(result.current.isSuccess).toBe(true)

      act(() => {
        result.current.clearError()
      })

      expect(result.current.isSuccess).toBe(false)
    })
  })

  describe('function stability', () => {
    it('returns stable function references', async () => {
      const authContext = createMockAuthContext()
      const { result, rerender } = renderHook(() => useProfile(), {
        wrapper: createWrapper(authContext),
      })

      const updateProfile1 = result.current.updateProfile
      const clearError1 = result.current.clearError

      rerender()

      expect(result.current.updateProfile).toBe(updateProfile1)
      expect(result.current.clearError).toBe(clearError1)
    })
  })
})

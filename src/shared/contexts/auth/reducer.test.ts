import { describe, it, expect } from 'vitest'
import { authReducer, initialState } from './reducer'
import { AuthActionType } from './actionTypes'
import type { AuthState } from './types'
import type { User } from '@types/auth'

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
}

const mockAuthPayload = {
  user: mockUser,
  token: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: '2024-12-31T23:59:59.000Z',
}

const mockTokenPayload = {
  token: 'new-access-token',
  refreshToken: 'new-refresh-token',
  expiresAt: '2025-01-01T00:00:00.000Z',
}

const authenticatedState: AuthState = {
  user: mockUser,
  token: 'existing-token',
  refreshToken: 'existing-refresh-token',
  expiresAt: '2024-12-15T00:00:00.000Z',
  isAuthenticated: true,
  isLoading: false,
  error: null,
}

describe('authReducer', () => {
  describe('initialState', () => {
    it('has correct default values', () => {
      expect(initialState.user).toBeNull()
      expect(initialState.token).toBeNull()
      expect(initialState.refreshToken).toBeNull()
      expect(initialState.expiresAt).toBeNull()
      expect(initialState.isAuthenticated).toBe(false)
      expect(initialState.isLoading).toBe(true)
      expect(initialState.error).toBeNull()
    })
  })

  describe('AUTH_START', () => {
    it('sets isLoading to true and clears error', () => {
      const stateWithError: AuthState = {
        ...initialState,
        isLoading: false,
        error: 'Previous error',
      }

      const result = authReducer(stateWithError, { type: AuthActionType.AUTH_START })

      expect(result.isLoading).toBe(true)
      expect(result.error).toBeNull()
    })

    it('preserves other state properties', () => {
      const result = authReducer(authenticatedState, { type: AuthActionType.AUTH_START })

      expect(result.user).toEqual(authenticatedState.user)
      expect(result.token).toEqual(authenticatedState.token)
      expect(result.isAuthenticated).toBe(true)
    })
  })

  describe('AUTH_SUCCESS', () => {
    it('sets authenticated state with user and tokens', () => {
      const result = authReducer(initialState, {
        type: AuthActionType.AUTH_SUCCESS,
        payload: mockAuthPayload,
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe(mockAuthPayload.token)
      expect(result.refreshToken).toBe(mockAuthPayload.refreshToken)
      expect(result.expiresAt).toBe(mockAuthPayload.expiresAt)
      expect(result.isAuthenticated).toBe(true)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBeNull()
    })

    it('allows null user in payload', () => {
      const result = authReducer(initialState, {
        type: AuthActionType.AUTH_SUCCESS,
        payload: { ...mockAuthPayload, user: null },
      })

      expect(result.user).toBeNull()
      expect(result.isAuthenticated).toBe(true)
    })

    it('clears previous error', () => {
      const stateWithError: AuthState = { ...initialState, error: 'Old error' }

      const result = authReducer(stateWithError, {
        type: AuthActionType.AUTH_SUCCESS,
        payload: mockAuthPayload,
      })

      expect(result.error).toBeNull()
    })
  })

  describe('AUTH_ERROR', () => {
    it('clears authentication state and sets error', () => {
      const result = authReducer(authenticatedState, {
        type: AuthActionType.AUTH_ERROR,
        payload: 'Authentication failed',
      })

      expect(result.user).toBeNull()
      expect(result.token).toBeNull()
      expect(result.refreshToken).toBeNull()
      expect(result.expiresAt).toBeNull()
      expect(result.isAuthenticated).toBe(false)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBe('Authentication failed')
    })
  })

  describe('SET_TOKENS', () => {
    it('updates tokens and sets authenticated', () => {
      const result = authReducer(initialState, {
        type: AuthActionType.SET_TOKENS,
        payload: mockTokenPayload,
      })

      expect(result.token).toBe(mockTokenPayload.token)
      expect(result.refreshToken).toBe(mockTokenPayload.refreshToken)
      expect(result.expiresAt).toBe(mockTokenPayload.expiresAt)
      expect(result.isAuthenticated).toBe(true)
      expect(result.isLoading).toBe(false)
    })

    it('preserves existing user', () => {
      const result = authReducer(authenticatedState, {
        type: AuthActionType.SET_TOKENS,
        payload: mockTokenPayload,
      })

      expect(result.user).toEqual(mockUser)
    })
  })

  describe('LOGOUT', () => {
    it('resets to initial state with isLoading false', () => {
      const result = authReducer(authenticatedState, { type: AuthActionType.LOGOUT })

      expect(result.user).toBeNull()
      expect(result.token).toBeNull()
      expect(result.refreshToken).toBeNull()
      expect(result.expiresAt).toBeNull()
      expect(result.isAuthenticated).toBe(false)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBeNull()
    })
  })

  describe('REFRESH_START', () => {
    it('clears error but preserves other state', () => {
      const stateWithError: AuthState = {
        ...authenticatedState,
        error: 'Previous error',
      }

      const result = authReducer(stateWithError, { type: AuthActionType.REFRESH_START })

      expect(result.error).toBeNull()
      expect(result.user).toEqual(authenticatedState.user)
      expect(result.token).toEqual(authenticatedState.token)
      expect(result.isAuthenticated).toBe(true)
    })
  })

  describe('REFRESH_SUCCESS', () => {
    it('updates tokens and clears loading state', () => {
      const result = authReducer(authenticatedState, {
        type: AuthActionType.REFRESH_SUCCESS,
        payload: mockTokenPayload,
      })

      expect(result.token).toBe(mockTokenPayload.token)
      expect(result.refreshToken).toBe(mockTokenPayload.refreshToken)
      expect(result.expiresAt).toBe(mockTokenPayload.expiresAt)
      expect(result.isAuthenticated).toBe(true)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBeNull()
    })

    it('updates user when provided in payload', () => {
      const updatedUser: User = { ...mockUser, firstName: 'Updated' }

      const result = authReducer(authenticatedState, {
        type: AuthActionType.REFRESH_SUCCESS,
        payload: { ...mockTokenPayload, user: updatedUser },
      })

      expect(result.user).toEqual(updatedUser)
    })

    it('preserves existing user when not provided in payload', () => {
      const result = authReducer(authenticatedState, {
        type: AuthActionType.REFRESH_SUCCESS,
        payload: mockTokenPayload,
      })

      expect(result.user).toEqual(mockUser)
    })
  })

  describe('REFRESH_ERROR', () => {
    it('resets to initial state with isLoading false', () => {
      const result = authReducer(authenticatedState, { type: AuthActionType.REFRESH_ERROR })

      expect(result.user).toBeNull()
      expect(result.token).toBeNull()
      expect(result.refreshToken).toBeNull()
      expect(result.expiresAt).toBeNull()
      expect(result.isAuthenticated).toBe(false)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBeNull()
    })
  })

  describe('UPDATE_USER', () => {
    it('updates user while preserving other state', () => {
      const updatedUser: User = {
        ...mockUser,
        firstName: 'NewFirst',
        lastName: 'NewLast',
      }

      const result = authReducer(authenticatedState, {
        type: AuthActionType.UPDATE_USER,
        payload: updatedUser,
      })

      expect(result.user).toEqual(updatedUser)
      expect(result.token).toEqual(authenticatedState.token)
      expect(result.refreshToken).toEqual(authenticatedState.refreshToken)
      expect(result.isAuthenticated).toBe(true)
    })
  })

  describe('unknown action', () => {
    it('returns current state unchanged', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' } as never

      const result = authReducer(authenticatedState, unknownAction)

      expect(result).toBe(authenticatedState)
    })
  })
})

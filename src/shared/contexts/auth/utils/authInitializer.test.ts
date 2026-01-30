import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { initializeAuth } from './authInitializer'
import { authService, userService } from '@shared/api'
import { AuthActionType } from '../actionTypes'
import type { AuthDispatch, ScheduleTokenRefreshFn, RefreshTokenManuallyFn } from './types'
import type { User } from '@types/auth'

vi.mock('@shared/api', () => ({
  authService: {
    getToken: vi.fn(),
    getRefreshToken: vi.fn(),
    getExpiresAt: vi.fn(),
  },
  userService: {
    getProfile: vi.fn(),
  },
}))

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
}

describe('initializeAuth', () => {
  let dispatch: Mock<AuthDispatch>
  let scheduleTokenRefresh: Mock<ScheduleTokenRefreshFn>
  let refreshTokenManually: Mock<RefreshTokenManuallyFn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))
    dispatch = vi.fn()
    scheduleTokenRefresh = vi.fn()
    refreshTokenManually = vi.fn().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('when no tokens exist', () => {
    it('dispatches LOGOUT when token is missing', async () => {
      (authService.getToken as Mock).mockReturnValue(null)
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T14:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.LOGOUT })
    })

    it('dispatches LOGOUT when refreshToken is missing', async () => {
      (authService.getToken as Mock).mockReturnValue('token')
      ;(authService.getRefreshToken as Mock).mockReturnValue(null)
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T14:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.LOGOUT })
    })

    it('dispatches LOGOUT when expiresAt is missing', async () => {
      (authService.getToken as Mock).mockReturnValue('token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue(null)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.LOGOUT })
    })

    it('dispatches LOGOUT when all tokens are missing', async () => {
      (authService.getToken as Mock).mockReturnValue(null)
      ;(authService.getRefreshToken as Mock).mockReturnValue(null)
      ;(authService.getExpiresAt as Mock).mockReturnValue(null)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.LOGOUT })
    })
  })

  describe('when tokens exist and are valid', () => {
    beforeEach(() => {
      (authService.getToken as Mock).mockReturnValue('valid-token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('valid-refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T14:00:00.000Z')
    })

    it('dispatches SET_TOKENS with stored values', async () => {
      (userService.getProfile as Mock).mockResolvedValue(mockUser)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({
        type: AuthActionType.SET_TOKENS,
        payload: {
          token: 'valid-token',
          refreshToken: 'valid-refresh',
          expiresAt: '2024-01-01T14:00:00.000Z',
        },
      })
    })

    it('schedules token refresh', async () => {
      (userService.getProfile as Mock).mockResolvedValue(mockUser)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(scheduleTokenRefresh).toHaveBeenCalledWith('2024-01-01T14:00:00.000Z')
    })

    it('fetches user profile and dispatches UPDATE_USER', async () => {
      (userService.getProfile as Mock).mockResolvedValue(mockUser)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(userService.getProfile).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledWith({
        type: AuthActionType.UPDATE_USER,
        payload: mockUser,
      })
    })

    it('continues without user when profile fetch fails', async () => {
      (userService.getProfile as Mock).mockRejectedValue(new Error('Network error'))

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith({
        type: AuthActionType.SET_TOKENS,
        payload: {
          token: 'valid-token',
          refreshToken: 'valid-refresh',
          expiresAt: '2024-01-01T14:00:00.000Z',
        },
      })
      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthActionType.UPDATE_USER })
      )
    })

    it('executes in correct order: SET_TOKENS, scheduleRefresh, then UPDATE_USER', async () => {
      const callOrder: string[] = []
      ;(dispatch as Mock).mockImplementation((action) => {
        callOrder.push(action.type)
      })
      scheduleTokenRefresh.mockImplementation(() => {
        callOrder.push('scheduleTokenRefresh')
      })
      ;(userService.getProfile as Mock).mockResolvedValue(mockUser)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(callOrder).toEqual([
        AuthActionType.SET_TOKENS,
        'scheduleTokenRefresh',
        AuthActionType.UPDATE_USER,
      ])
    })
  })

  describe('when tokens exist but are expired', () => {
    it('calls refreshTokenManually when token is expired', async () => {
      (authService.getToken as Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T10:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(refreshTokenManually).toHaveBeenCalledTimes(1)
    })

    it('does not dispatch SET_TOKENS for expired token', async () => {
      (authService.getToken as Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T10:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthActionType.SET_TOKENS })
      )
    })

    it('does not schedule token refresh for expired token', async () => {
      (authService.getToken as Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T10:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(scheduleTokenRefresh).not.toHaveBeenCalled()
    })

    it('does not fetch user profile for expired token', async () => {
      (authService.getToken as Mock).mockReturnValue('expired-token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T10:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(userService.getProfile).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles token expiring exactly at current time', async () => {
      (authService.getToken as Mock).mockReturnValue('token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T12:00:00.000Z')

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(refreshTokenManually).toHaveBeenCalled()
    })

    it('handles token expiring 1ms in the future', async () => {
      (authService.getToken as Mock).mockReturnValue('token')
      ;(authService.getRefreshToken as Mock).mockReturnValue('refresh')
      ;(authService.getExpiresAt as Mock).mockReturnValue('2024-01-01T12:00:00.001Z')
      ;(userService.getProfile as Mock).mockResolvedValue(mockUser)

      await initializeAuth(dispatch, scheduleTokenRefresh, refreshTokenManually)

      expect(dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: AuthActionType.SET_TOKENS })
      )
    })
  })
})

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { refreshToken } from './tokenRefresher'
import { authService, userService } from '@shared/api'
import { AuthActionType } from '../actionTypes'
import type { IsRefreshingRef, AuthDispatch, ScheduleTokenRefreshFn, LogoutFn } from './types'
import type { AuthResponse } from '@shared/api/authService'
import type { User } from '@shared/types/auth/user.types'

vi.mock('@shared/api', () => ({
  authService: {
    refreshToken: vi.fn(),
    getRefreshToken: vi.fn(),
    logout: vi.fn(),
  },
  userService: {
    getProfile: vi.fn(),
  },
}))

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: null,
  lastName: null,
  phoneNumber: null,
  role: 'user',
  authProvider: null,
  emailVerified: false,
  lastLoginAt: null,
  avatarOptimizedUrl: null,
  avatarThumbnailUrl: null,
  addresses: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

const mockAuthResponse: AuthResponse = {
  token: 'new-access-token',
  refreshToken: 'new-refresh-token',
  expiration: '2024-12-31T23:59:59.000Z',
  userId: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'User',
  authProvider: 'Local',
  emailVerified: true,
}

describe('refreshToken', () => {
  let isRefreshingRef: IsRefreshingRef
  let dispatch: Mock<AuthDispatch>
  let scheduleTokenRefresh: Mock<ScheduleTokenRefreshFn>
  let logout: Mock<LogoutFn>

  beforeEach(() => {
    vi.clearAllMocks()
    isRefreshingRef = { current: false }
    dispatch = vi.fn()
    scheduleTokenRefresh = vi.fn()
    logout = vi.fn()
  })

  it('returns early if already refreshing', async () => {
    isRefreshingRef.current = true

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(dispatch).not.toHaveBeenCalled()
    expect(authService.refreshToken).not.toHaveBeenCalled()
  })

  it('calls logout if no refresh token available', async () => {
    await refreshToken(isRefreshingRef, null, dispatch, scheduleTokenRefresh, logout)

    expect(logout).toHaveBeenCalled()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('uses getRefreshToken from authService when currentRefreshToken is null', async () => {
    (authService.getRefreshToken as Mock).mockReturnValue(null)

    await refreshToken(isRefreshingRef, null, dispatch, scheduleTokenRefresh, logout)

    expect(authService.getRefreshToken).toHaveBeenCalled()
    expect(logout).toHaveBeenCalled()
  })

  it('uses currentRefreshToken when provided', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)

    await refreshToken(isRefreshingRef, 'current-token', dispatch, scheduleTokenRefresh, logout)

    expect(authService.refreshToken).toHaveBeenCalledWith('current-token')
    expect(authService.getRefreshToken).not.toHaveBeenCalled()
  })

  it('dispatches REFRESH_START at the beginning', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.REFRESH_START })
  })

  it('sets isRefreshingRef.current to true during refresh', async () => {
    let wasRefreshingDuringCall = false
    ;(authService.refreshToken as Mock).mockImplementation(() => {
      wasRefreshingDuringCall = isRefreshingRef.current
      return Promise.resolve(mockAuthResponse)
    })

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(wasRefreshingDuringCall).toBe(true)
  })

  it('resets isRefreshingRef.current to false after successful refresh', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(isRefreshingRef.current).toBe(false)
  })

  it('resets isRefreshingRef.current to false after failed refresh', async () => {
    (authService.refreshToken as Mock).mockRejectedValue(new Error('Refresh failed'))

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(isRefreshingRef.current).toBe(false)
  })

  it('dispatches REFRESH_SUCCESS with user from profile service', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)
    ;(userService.getProfile as Mock).mockResolvedValue(mockUser)

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(userService.getProfile).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({
      type: AuthActionType.REFRESH_SUCCESS,
      payload: {
        token: mockAuthResponse.token,
        refreshToken: mockAuthResponse.refreshToken,
        expiresAt: mockAuthResponse.expiration,
        user: mockUser,
      },
    })
  })

  it('falls back to minimal user from response when profile fetch fails', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)
    ;(userService.getProfile as Mock).mockRejectedValue(new Error('Profile fetch failed'))

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(dispatch).toHaveBeenCalledWith({
      type: AuthActionType.REFRESH_SUCCESS,
      payload: {
        token: mockAuthResponse.token,
        refreshToken: mockAuthResponse.refreshToken,
        expiresAt: mockAuthResponse.expiration,
        user: {
          id: mockAuthResponse.userId,
          username: mockAuthResponse.username,
          email: mockAuthResponse.email,
          firstName: null,
          lastName: null,
          phoneNumber: null,
          role: mockAuthResponse.role,
          authProvider: mockAuthResponse.authProvider,
          emailVerified: mockAuthResponse.emailVerified,
          lastLoginAt: null,
          avatarOptimizedUrl: null,
          avatarThumbnailUrl: null,
          addresses: [],
          createdAt: '',
          updatedAt: '',
        },
      },
    })
  })

  it('schedules next token refresh after success', async () => {
    (authService.refreshToken as Mock).mockResolvedValue(mockAuthResponse)

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(scheduleTokenRefresh).toHaveBeenCalledWith(mockAuthResponse.expiration)
  })

  it('dispatches REFRESH_ERROR on failure', async () => {
    (authService.refreshToken as Mock).mockRejectedValue(new Error('Network error'))

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(dispatch).toHaveBeenCalledWith({ type: AuthActionType.REFRESH_ERROR })
  })

  it('calls authService.logout on failure', async () => {
    (authService.refreshToken as Mock).mockRejectedValue(new Error('Network error'))

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(authService.logout).toHaveBeenCalled()
  })

  it('does not call user logout callback on refresh failure', async () => {
    (authService.refreshToken as Mock).mockRejectedValue(new Error('Network error'))

    await refreshToken(isRefreshingRef, 'token', dispatch, scheduleTokenRefresh, logout)

    expect(logout).not.toHaveBeenCalled()
  })
})

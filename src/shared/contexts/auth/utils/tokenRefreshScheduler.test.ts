import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scheduleTokenRefresh, clearTokenRefreshTimeout } from './tokenRefreshScheduler'
import type { RefreshTimeoutRef, RefreshTokenManuallyFn, LogoutFn } from './types'

describe('scheduleTokenRefresh', () => {
  let refreshTimeoutRef: RefreshTimeoutRef
  let refreshTokenManually: ReturnType<typeof vi.fn<RefreshTokenManuallyFn>>
  let logout: ReturnType<typeof vi.fn<LogoutFn>>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'))
    refreshTimeoutRef = { current: null }
    refreshTokenManually = vi.fn()
    logout = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears existing timeout before scheduling new one', () => {
    const existingTimeout = setTimeout(() => {}, 1000)
    refreshTimeoutRef.current = existingTimeout
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    const expiresAt = new Date('2024-01-01T12:10:00.000Z').toISOString()
    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(clearTimeoutSpy).toHaveBeenCalledWith(existingTimeout)
  })

  it('schedules refresh 2 minutes before expiration', () => {
    const expiresAt = new Date('2024-01-01T12:10:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTokenManually).not.toHaveBeenCalled()

    vi.advanceTimersByTime(8 * 60 * 1000 - 1)
    expect(refreshTokenManually).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(refreshTokenManually).toHaveBeenCalledTimes(1)
  })

  it('stores timeout reference in ref', () => {
    const expiresAt = new Date('2024-01-01T12:10:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTimeoutRef.current).not.toBeNull()
  })

  it('refreshes immediately when less than 2 minutes until expiry', () => {
    const expiresAt = new Date('2024-01-01T12:01:30.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTokenManually).toHaveBeenCalledTimes(1)
  })

  it('calls logout when token is already expired', () => {
    const expiresAt = new Date('2024-01-01T11:59:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(logout).toHaveBeenCalledTimes(1)
    expect(refreshTokenManually).not.toHaveBeenCalled()
  })

  it('does not call logout when token expires exactly now', () => {
    const expiresAt = new Date('2024-01-01T12:00:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it('calculates correct delay for long-lived tokens', () => {
    const expiresAt = new Date('2024-01-01T14:00:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    vi.advanceTimersByTime(118 * 60 * 1000 - 1)
    expect(refreshTokenManually).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(refreshTokenManually).toHaveBeenCalledTimes(1)
  })

  it('refreshes immediately when exactly 2 minutes until expiry', () => {
    const expiresAt = new Date('2024-01-01T12:02:00.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTokenManually).toHaveBeenCalledTimes(1)
  })

  it('handles slightly more than 2 minutes until expiry', () => {
    const expiresAt = new Date('2024-01-01T12:02:01.000Z').toISOString()

    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTokenManually).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(refreshTokenManually).toHaveBeenCalledTimes(1)
  })

  it('resets ref to null when clearing existing timeout', () => {
    const existingTimeout = setTimeout(() => {}, 1000)
    refreshTimeoutRef.current = existingTimeout

    const expiresAt = new Date('2024-01-01T11:00:00.000Z').toISOString()
    scheduleTokenRefresh(expiresAt, refreshTimeoutRef, refreshTokenManually, logout)

    expect(refreshTimeoutRef.current).toBeNull()
  })
})

describe('clearTokenRefreshTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears timeout when one exists', () => {
    const refreshTimeoutRef: RefreshTimeoutRef = {
      current: setTimeout(() => {}, 1000),
    }
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    clearTokenRefreshTimeout(refreshTimeoutRef)

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('sets ref to null after clearing', () => {
    const refreshTimeoutRef: RefreshTimeoutRef = {
      current: setTimeout(() => {}, 1000),
    }

    clearTokenRefreshTimeout(refreshTimeoutRef)

    expect(refreshTimeoutRef.current).toBeNull()
  })

  it('does nothing when ref is already null', () => {
    const refreshTimeoutRef: RefreshTimeoutRef = { current: null }
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    clearTokenRefreshTimeout(refreshTimeoutRef)

    expect(clearTimeoutSpy).not.toHaveBeenCalled()
    expect(refreshTimeoutRef.current).toBeNull()
  })

  it('can be called multiple times safely', () => {
    const refreshTimeoutRef: RefreshTimeoutRef = {
      current: setTimeout(() => {}, 1000),
    }

    clearTokenRefreshTimeout(refreshTimeoutRef)
    clearTokenRefreshTimeout(refreshTimeoutRef)
    clearTokenRefreshTimeout(refreshTimeoutRef)

    expect(refreshTimeoutRef.current).toBeNull()
  })
})

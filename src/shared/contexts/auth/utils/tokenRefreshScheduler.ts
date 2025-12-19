import type { RefreshTimeoutRef, RefreshTokenManuallyFn, LogoutFn } from './types';

/**
 * Schedule automatic token refresh before expiration
 * Refreshes 2 minutes before token expires
 *
 * @param expiresAt - ISO string of token expiration time
 * @param refreshTimeoutRef - Ref to store the timeout ID
 * @param refreshTokenManually - Function to call when refresh is needed
 * @param logout - Function to call if token is already expired
 */
export function scheduleTokenRefresh(
  expiresAt: string,
  refreshTimeoutRef: RefreshTimeoutRef,
  refreshTokenManually: RefreshTokenManuallyFn,
  logout: LogoutFn
): void {
  // Clear any existing timeout
  if (refreshTimeoutRef.current) {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = null;
  }

  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;

  // Refresh 2 minutes (120000ms) before expiration
  const refreshBuffer = 2 * 60 * 1000;
  const timeUntilRefresh = timeUntilExpiry - refreshBuffer;

  // Only schedule if we have time before expiry
  if (timeUntilRefresh > 0) {
    refreshTimeoutRef.current = setTimeout(() => {
      refreshTokenManually();
    }, timeUntilRefresh);
  } else if (timeUntilExpiry > 0) {
    // Token expires soon, try to refresh immediately
    refreshTokenManually();
  } else {
    // Token already expired
    logout();
  }
}

/**
 * Clear the scheduled token refresh timeout
 *
 * @param refreshTimeoutRef - Ref storing the timeout ID
 */
export function clearTokenRefreshTimeout(refreshTimeoutRef: RefreshTimeoutRef): void {
  if (refreshTimeoutRef.current) {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = null;
  }
}

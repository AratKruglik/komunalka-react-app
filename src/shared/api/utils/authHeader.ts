import type { AxiosRequestHeaders } from 'axios';

/**
 * Add Authorization header to existing headers if token is provided
 *
 * @param headers - Existing headers object
 * @param token - Optional authentication token
 * @returns Headers with Authorization added if token exists
 */
export function withAuthHeader(
  headers: AxiosRequestHeaders | undefined,
  token?: string | null
): AxiosRequestHeaders {
  if (!token) {
    return (headers || {}) as AxiosRequestHeaders;
  }

  return {
    ...(headers || {}),
    Authorization: `Bearer ${token}`,
  } as AxiosRequestHeaders;
}

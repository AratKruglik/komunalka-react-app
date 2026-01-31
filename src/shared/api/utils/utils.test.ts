import { describe, it, expect, vi } from 'vitest'
import type { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios'
import { formatApiError, type ApiError } from './errorFormatter'
import { withAuthHeader } from './authHeader'

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios')
  return {
    ...actual,
    default: {
      ...(actual as object),
      isAxiosError: (error: unknown): error is AxiosError => {
        return error !== null && typeof error === 'object' && 'isAxiosError' in error
      },
    },
  }
})

function createAxiosError(
  status: number,
  message: string,
  responseData?: unknown
): AxiosError {
  const error = new Error(message) as AxiosError
  error.isAxiosError = true
  error.response = {
    status,
    statusText: message,
    data: responseData ?? { message },
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  }
  error.config = {} as InternalAxiosRequestConfig
  return error
}

function createNetworkError(message: string): AxiosError {
  const error = new Error(message) as AxiosError
  error.isAxiosError = true
  error.config = {} as InternalAxiosRequestConfig
  return error
}

describe('formatApiError', () => {
  describe('with Axios errors', () => {
    it('extracts message from response data', () => {
      const error = createAxiosError(400, 'Bad Request', { message: 'Validation failed' })

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('Validation failed')
      expect(result.status).toBe(400)
    })

    it('uses error message when response data has no message', () => {
      const error = createAxiosError(500, 'Internal Server Error', { error: 'Something went wrong' })

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('Internal Server Error')
      expect(result.status).toBe(500)
    })

    it('includes response data in result', () => {
      const responseData = { message: 'Not found', code: 'RESOURCE_NOT_FOUND' }
      const error = createAxiosError(404, 'Not Found', responseData)

      const result = formatApiError(error) as ApiError

      expect(result.data).toEqual(responseData)
    })

    it('handles 401 Unauthorized', () => {
      const error = createAxiosError(401, 'Unauthorized', { message: 'Invalid token' })

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('Invalid token')
      expect(result.status).toBe(401)
    })

    it('handles 403 Forbidden', () => {
      const error = createAxiosError(403, 'Forbidden', { message: 'Access denied' })

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('Access denied')
      expect(result.status).toBe(403)
    })

    it('handles network errors without response', () => {
      const error = createNetworkError('Network Error')

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('Network Error')
      expect(result.status).toBeUndefined()
      expect(result.data).toBeUndefined()
    })

    it('handles timeout errors', () => {
      const error = createNetworkError('timeout of 10000ms exceeded')

      const result = formatApiError(error) as ApiError

      expect(result.message).toBe('timeout of 10000ms exceeded')
    })
  })

  describe('with non-Axios errors', () => {
    it('returns original Error object', () => {
      const error = new Error('Something went wrong')

      const result = formatApiError(error)

      expect(result).toBe(error)
    })

    it('returns original string error', () => {
      const error = 'String error'

      const result = formatApiError(error)

      expect(result).toBe(error)
    })

    it('returns original null', () => {
      const result = formatApiError(null)

      expect(result).toBeNull()
    })

    it('returns original undefined', () => {
      const result = formatApiError(undefined)

      expect(result).toBeUndefined()
    })

    it('returns original object error', () => {
      const error = { code: 'CUSTOM_ERROR', details: 'Some details' }

      const result = formatApiError(error)

      expect(result).toBe(error)
    })
  })
})

describe('withAuthHeader', () => {
  describe('when token is provided', () => {
    it('adds Authorization header to empty headers', () => {
      const result = withAuthHeader(undefined, 'my-jwt-token')

      expect(result).toEqual({
        Authorization: 'Bearer my-jwt-token',
      })
    })

    it('adds Authorization header to existing headers', () => {
      const existingHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      } as AxiosHeaders

      const result = withAuthHeader(existingHeaders, 'test-token')

      expect(result).toEqual({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer test-token',
      })
    })

    it('overwrites existing Authorization header', () => {
      const existingHeaders = {
        Authorization: 'Bearer old-token',
      } as AxiosHeaders

      const result = withAuthHeader(existingHeaders, 'new-token')

      expect(result.Authorization).toBe('Bearer new-token')
    })

    it('handles headers with custom fields', () => {
      const existingHeaders = {
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': '12345',
      } as AxiosHeaders

      const result = withAuthHeader(existingHeaders, 'token')

      expect(result).toEqual({
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': '12345',
        'Authorization': 'Bearer token',
      })
    })
  })

  describe('when token is not provided', () => {
    it('returns empty object when headers undefined and no token', () => {
      const result = withAuthHeader(undefined, undefined)

      expect(result).toEqual({})
    })

    it('returns empty object when headers undefined and token is null', () => {
      const result = withAuthHeader(undefined, null)

      expect(result).toEqual({})
    })

    it('returns empty object when headers undefined and token is empty string', () => {
      const result = withAuthHeader(undefined, '')

      expect(result).toEqual({})
    })

    it('returns original headers when no token', () => {
      const existingHeaders = {
        'Content-Type': 'application/json',
      } as AxiosHeaders

      const result = withAuthHeader(existingHeaders, null)

      expect(result).toEqual({
        'Content-Type': 'application/json',
      })
    })

    it('does not add Authorization header when token is undefined', () => {
      const existingHeaders = {
        'Accept': '*/*',
      } as AxiosHeaders

      const result = withAuthHeader(existingHeaders, undefined)

      expect(result).not.toHaveProperty('Authorization')
    })
  })
})

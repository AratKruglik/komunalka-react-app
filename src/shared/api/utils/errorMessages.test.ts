import { describe, it, expect } from 'vitest'
import type { ApiError } from './errorFormatter'
import { getLocalizedErrorMessage } from './errorMessages'

describe('getLocalizedErrorMessage', () => {
  describe('status-based messages', () => {
    it('returns Ukrainian message for status 401', () => {
      const error: ApiError = { message: 'Unauthorized', status: 401 }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Невірна електронна пошта або пароль.')
    })

    it('returns Ukrainian message for status 400', () => {
      const error: ApiError = { message: 'Bad Request', status: 400 }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Невірні дані. Перевірте заповнені поля.')
    })

    it('returns Ukrainian message for status 500', () => {
      const error: ApiError = { message: 'Internal Server Error', status: 500 }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Помилка сервера. Спробуйте пізніше.')
    })
  })

  describe('message-based detection', () => {
    it('returns network error message when message contains "Network Error"', () => {
      const error: ApiError = { message: 'Network Error' }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Помилка мережі. Перевірте підключення до Інтернету.')
    })

    it('returns timeout message when message contains "timeout"', () => {
      const error: ApiError = { message: 'timeout of 10000ms exceeded' }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Час очікування вичерпано. Спробуйте ще раз.')
    })
  })

  describe('fallback behavior', () => {
    it('returns default message for unknown status without special message keywords', () => {
      const error: ApiError = { message: 'Something unexpected', status: 418 }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Сталася непередбачена помилка. Спробуйте ще раз.')
    })
  })

  describe('priority', () => {
    it('status-based message takes priority over message content', () => {
      const error: ApiError = { message: 'Network Error', status: 401 }

      const result = getLocalizedErrorMessage(error)

      expect(result).toBe('Невірна електронна пошта або пароль.')
    })
  })
})

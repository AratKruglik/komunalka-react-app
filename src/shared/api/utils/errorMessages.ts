import type { ApiError } from './errorFormatter'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Невірні дані. Перевірте заповнені поля.',
  401: 'Невірна електронна пошта або пароль.',
  403: 'Доступ заборонено.',
  404: 'Ресурс не знайдено.',
  408: 'Час очікування вичерпано. Спробуйте ще раз.',
  409: 'Конфлікт даних. Можливо, такий запис вже існує.',
  422: 'Дані не пройшли валідацію.',
  429: 'Забагато запитів. Зачекайте та спробуйте пізніше.',
  500: 'Помилка сервера. Спробуйте пізніше.',
  502: 'Сервер тимчасово недоступний. Спробуйте пізніше.',
  503: 'Сервіс тимчасово недоступний. Спробуйте пізніше.',
}

const NETWORK_ERROR_MESSAGE = 'Помилка мережі. Перевірте підключення до Інтернету.'
const TIMEOUT_ERROR_MESSAGE = 'Час очікування вичерпано. Спробуйте ще раз.'
const DEFAULT_ERROR_MESSAGE = 'Сталася непередбачена помилка. Спробуйте ще раз.'

export function getLocalizedErrorMessage(error: ApiError): string {
  if (error.status && STATUS_MESSAGES[error.status]) {
    return STATUS_MESSAGES[error.status]
  }

  if (error.message.includes('Network Error')) {
    return NETWORK_ERROR_MESSAGE
  }

  if (error.message.includes('timeout')) {
    return TIMEOUT_ERROR_MESSAGE
  }

  return DEFAULT_ERROR_MESSAGE
}

interface JwtPayload {
  sub?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    const base64Payload = parts[1]
    const payload = atob(base64Payload)
    return JSON.parse(payload) as T
  } catch {
    return null
  }
}

export function getUserIdFromToken(token: string): number | null {
  const payload = decodeJwtPayload(token)
  if (payload?.sub) {
    const userId = parseInt(payload.sub, 10)
    return isNaN(userId) ? null : userId
  }
  return null
}

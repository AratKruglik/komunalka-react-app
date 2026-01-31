import { describe, it, expect } from 'vitest'
import { decodeJwtPayload, getUserIdFromToken } from './jwt'

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'mock-signature'
  return `${header}.${body}.${signature}`
}

describe('decodeJwtPayload', () => {
  it('decodes valid JWT payload', () => {
    const payload = { sub: '123', email: 'test@example.com', exp: 1234567890 }
    const token = createMockJwt(payload)

    const result = decodeJwtPayload(token)

    expect(result).toEqual(payload)
  })

  it('returns null for token with wrong number of parts', () => {
    expect(decodeJwtPayload('invalid')).toBeNull()
    expect(decodeJwtPayload('only.two')).toBeNull()
    expect(decodeJwtPayload('one.two.three.four')).toBeNull()
  })

  it('returns null for token with invalid base64', () => {
    const result = decodeJwtPayload('header.!!!invalid-base64!!!.signature')

    expect(result).toBeNull()
  })

  it('returns null for token with invalid JSON', () => {
    const invalidJson = btoa('not-json')
    const result = decodeJwtPayload(`header.${invalidJson}.signature`)

    expect(result).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(decodeJwtPayload('')).toBeNull()
  })
})

describe('getUserIdFromToken', () => {
  it('extracts numeric userId from sub claim', () => {
    const token = createMockJwt({ sub: '42' })

    const result = getUserIdFromToken(token)

    expect(result).toBe(42)
  })

  it('returns null when sub claim is missing', () => {
    const token = createMockJwt({ email: 'test@example.com' })

    const result = getUserIdFromToken(token)

    expect(result).toBeNull()
  })

  it('returns null when sub is not a valid number', () => {
    const token = createMockJwt({ sub: 'not-a-number' })

    const result = getUserIdFromToken(token)

    expect(result).toBeNull()
  })

  it('returns null for invalid token', () => {
    const result = getUserIdFromToken('invalid-token')

    expect(result).toBeNull()
  })

  it('handles sub with leading zeros', () => {
    const token = createMockJwt({ sub: '007' })

    const result = getUserIdFromToken(token)

    expect(result).toBe(7)
  })
})

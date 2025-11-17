/**
 * Helper utilities for generating sequential numeric IDs for mock data.
 *
 * ID Ranges:
 * - Addresses: 1-99
 * - Providers: 1-99
 * - Meters: 100-999
 * - Readings: 1000+
 */

let addressIdCounter = 1
let providerIdCounter = 1
let meterIdCounter = 100
let readingIdCounter = 1000

/**
 * Generate next address ID (range: 1-99)
 */
export function generateAddressId(): number {
  if (addressIdCounter > 99) {
    throw new Error('Address ID counter exceeded maximum (99)')
  }
  return addressIdCounter++
}

/**
 * Generate next provider ID (range: 1-99)
 */
export function generateProviderId(): number {
  if (providerIdCounter > 99) {
    throw new Error('Provider ID counter exceeded maximum (99)')
  }
  return providerIdCounter++
}

/**
 * Generate next meter ID (range: 100-999)
 */
export function generateMeterId(): number {
  if (meterIdCounter > 999) {
    throw new Error('Meter ID counter exceeded maximum (999)')
  }
  return meterIdCounter++
}

/**
 * Generate next reading ID (range: 1000+)
 */
export function generateReadingId(): number {
  return readingIdCounter++
}

/**
 * Reset all ID counters (useful for testing)
 */
export function resetIdCounters(): void {
  addressIdCounter = 1
  providerIdCounter = 1
  meterIdCounter = 100
  readingIdCounter = 1000
}

/**
 * Set ID counter to specific value (useful for deterministic mock data)
 */
export function setIdCounters(config: {
  address?: number
  provider?: number
  meter?: number
  reading?: number
}): void {
  if (config.address !== undefined) addressIdCounter = config.address
  if (config.provider !== undefined) providerIdCounter = config.provider
  if (config.meter !== undefined) meterIdCounter = config.meter
  if (config.reading !== undefined) readingIdCounter = config.reading
}

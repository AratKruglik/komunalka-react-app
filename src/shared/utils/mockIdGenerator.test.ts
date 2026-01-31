import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateAddressId,
  generateProviderId,
  generateMeterId,
  generateReadingId,
  resetIdCounters,
  setIdCounters,
} from './mockIdGenerator'

describe('mockIdGenerator', () => {
  beforeEach(() => {
    resetIdCounters()
  })

  describe('generateAddressId', () => {
    it('starts from 1 after reset', () => {
      expect(generateAddressId()).toBe(1)
    })

    it('increments on each call', () => {
      expect(generateAddressId()).toBe(1)
      expect(generateAddressId()).toBe(2)
      expect(generateAddressId()).toBe(3)
    })

    it('throws when exceeding maximum (99)', () => {
      setIdCounters({ address: 100 })
      expect(() => generateAddressId()).toThrow(
        'Address ID counter exceeded maximum (99)'
      )
    })

    it('allows generating ID 99 but not 100', () => {
      setIdCounters({ address: 99 })
      expect(generateAddressId()).toBe(99)
      expect(() => generateAddressId()).toThrow(
        'Address ID counter exceeded maximum (99)'
      )
    })
  })

  describe('generateProviderId', () => {
    it('starts from 1 after reset', () => {
      expect(generateProviderId()).toBe(1)
    })

    it('increments on each call', () => {
      expect(generateProviderId()).toBe(1)
      expect(generateProviderId()).toBe(2)
      expect(generateProviderId()).toBe(3)
    })

    it('throws when exceeding maximum (99)', () => {
      setIdCounters({ provider: 100 })
      expect(() => generateProviderId()).toThrow(
        'Provider ID counter exceeded maximum (99)'
      )
    })

    it('allows generating ID 99 but not 100', () => {
      setIdCounters({ provider: 99 })
      expect(generateProviderId()).toBe(99)
      expect(() => generateProviderId()).toThrow(
        'Provider ID counter exceeded maximum (99)'
      )
    })
  })

  describe('generateMeterId', () => {
    it('starts from 100 after reset', () => {
      expect(generateMeterId()).toBe(100)
    })

    it('increments on each call', () => {
      expect(generateMeterId()).toBe(100)
      expect(generateMeterId()).toBe(101)
      expect(generateMeterId()).toBe(102)
    })

    it('throws when exceeding maximum (999)', () => {
      setIdCounters({ meter: 1000 })
      expect(() => generateMeterId()).toThrow(
        'Meter ID counter exceeded maximum (999)'
      )
    })

    it('allows generating ID 999 but not 1000', () => {
      setIdCounters({ meter: 999 })
      expect(generateMeterId()).toBe(999)
      expect(() => generateMeterId()).toThrow(
        'Meter ID counter exceeded maximum (999)'
      )
    })
  })

  describe('generateReadingId', () => {
    it('starts from 1000 after reset', () => {
      expect(generateReadingId()).toBe(1000)
    })

    it('increments on each call', () => {
      expect(generateReadingId()).toBe(1000)
      expect(generateReadingId()).toBe(1001)
      expect(generateReadingId()).toBe(1002)
    })

    it('has no upper limit', () => {
      setIdCounters({ reading: 999999 })
      expect(generateReadingId()).toBe(999999)
      expect(generateReadingId()).toBe(1000000)
    })
  })

  describe('resetIdCounters', () => {
    it('resets all counters to initial values', () => {
      generateAddressId()
      generateAddressId()
      generateProviderId()
      generateMeterId()
      generateReadingId()
      generateReadingId()
      generateReadingId()

      resetIdCounters()

      expect(generateAddressId()).toBe(1)
      expect(generateProviderId()).toBe(1)
      expect(generateMeterId()).toBe(100)
      expect(generateReadingId()).toBe(1000)
    })

    it('resets counters after setIdCounters', () => {
      setIdCounters({ address: 50, provider: 25, meter: 500, reading: 5000 })

      resetIdCounters()

      expect(generateAddressId()).toBe(1)
      expect(generateProviderId()).toBe(1)
      expect(generateMeterId()).toBe(100)
      expect(generateReadingId()).toBe(1000)
    })
  })

  describe('setIdCounters', () => {
    it('sets address counter only', () => {
      setIdCounters({ address: 50 })

      expect(generateAddressId()).toBe(50)
      expect(generateProviderId()).toBe(1)
      expect(generateMeterId()).toBe(100)
      expect(generateReadingId()).toBe(1000)
    })

    it('sets provider counter only', () => {
      setIdCounters({ provider: 25 })

      expect(generateAddressId()).toBe(1)
      expect(generateProviderId()).toBe(25)
      expect(generateMeterId()).toBe(100)
      expect(generateReadingId()).toBe(1000)
    })

    it('sets meter counter only', () => {
      setIdCounters({ meter: 500 })

      expect(generateAddressId()).toBe(1)
      expect(generateProviderId()).toBe(1)
      expect(generateMeterId()).toBe(500)
      expect(generateReadingId()).toBe(1000)
    })

    it('sets reading counter only', () => {
      setIdCounters({ reading: 5000 })

      expect(generateAddressId()).toBe(1)
      expect(generateProviderId()).toBe(1)
      expect(generateMeterId()).toBe(100)
      expect(generateReadingId()).toBe(5000)
    })

    it('sets multiple counters at once', () => {
      setIdCounters({ address: 10, provider: 20, meter: 300, reading: 4000 })

      expect(generateAddressId()).toBe(10)
      expect(generateProviderId()).toBe(20)
      expect(generateMeterId()).toBe(300)
      expect(generateReadingId()).toBe(4000)
    })

    it('sets counters with empty config (no changes)', () => {
      generateAddressId()
      generateProviderId()
      generateMeterId()
      generateReadingId()

      setIdCounters({})

      expect(generateAddressId()).toBe(2)
      expect(generateProviderId()).toBe(2)
      expect(generateMeterId()).toBe(101)
      expect(generateReadingId()).toBe(1001)
    })

    it('allows setting counter to 0', () => {
      setIdCounters({ address: 0 })
      expect(generateAddressId()).toBe(0)
    })
  })

  describe('counter independence', () => {
    it('each counter increments independently', () => {
      expect(generateAddressId()).toBe(1)
      expect(generateAddressId()).toBe(2)
      expect(generateMeterId()).toBe(100)
      expect(generateAddressId()).toBe(3)
      expect(generateMeterId()).toBe(101)
      expect(generateProviderId()).toBe(1)
      expect(generateReadingId()).toBe(1000)
      expect(generateAddressId()).toBe(4)
    })

    it('setting one counter does not affect others', () => {
      generateAddressId()
      generateProviderId()
      generateMeterId()
      generateReadingId()

      setIdCounters({ address: 99 })

      expect(generateAddressId()).toBe(99)
      expect(generateProviderId()).toBe(2)
      expect(generateMeterId()).toBe(101)
      expect(generateReadingId()).toBe(1001)
    })
  })
})

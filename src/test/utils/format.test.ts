import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDate, formatTimestamp, formatFieldName, getStatusColor } from '../../utils/format'

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('returns "Never" for null', () => {
    expect(formatDate(null)).toBe('Never')
  })

  it('returns "Just now" for timestamps under 1 minute ago', () => {
    const recent = new Date(Date.now() - 30_000).toISOString()
    expect(formatDate(recent)).toBe('Just now')
  })

  it('returns minutes ago for timestamps under 1 hour', () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60_000).toISOString()
    expect(formatDate(thirtyMinAgo)).toBe('30 minutes ago')
  })

  it('uses singular "minute" for exactly 1 minute ago', () => {
    const oneMinAgo = new Date(Date.now() - 61_000).toISOString()
    expect(formatDate(oneMinAgo)).toBe('1 minute ago')
  })

  it('returns hours ago for timestamps under 24 hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString()
    expect(formatDate(threeHoursAgo)).toBe('3 hours ago')
  })

  it('returns days ago for timestamps under 7 days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
    expect(formatDate(twoDaysAgo)).toBe('2 days ago')
  })

  it('returns a formatted date string for timestamps older than 7 days', () => {
    const oldDate = new Date(Date.now() - 10 * 86_400_000).toISOString()
    const result = formatDate(oldDate)
    expect(result).not.toMatch(/ago/)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('formatFieldName', () => {
  it('capitalizes a simple field name', () => {
    expect(formatFieldName('email')).toBe('Email')
  })

  it('splits dot notation into capitalized words', () => {
    expect(formatFieldName('user.email')).toBe('User Email')
  })

  it('handles multi-level dot notation', () => {
    expect(formatFieldName('billing.address.city')).toBe('Billing Address City')
  })
})

describe('getStatusColor', () => {
  it.each([
    ['synced', 'green'],
    ['conflict', 'yellow'],
    ['error', 'red'],
    ['not_synced', 'gray'],
    ['syncing', 'blue'],
    ['success', 'green'],
    ['failed', 'red'],
    ['partial', 'yellow'],
  ])('maps status "%s" to color "%s"', (status, expected) => {
    expect(getStatusColor(status)).toBe(expected)
  })

  it('returns "gray" for unknown statuses', () => {
    expect(getStatusColor('unknown_status')).toBe('gray')
  })
})

describe('formatTimestamp', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatTimestamp('2024-01-15T10:30:00.000Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

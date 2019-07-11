jest.mock('crypto')

import isValid from '../src/webhook'
import { createHmac } from 'crypto'

describe('@workgrid/webhook-validation', () => {
  let secret: string
  let body: string
  let digest: string

  beforeAll(() => {
    secret = 'secret'
    body = 'body'
    digest = 'digest'

    const mockDigest = jest.fn(() => digest)
    const mockUpdate = jest.fn(() => ({ digest: mockDigest }))
    createHmac.mockImplementation(() => ({ update: mockUpdate }))
  })

  describe('isValid()', () => {
    test('should return true if the digest matches', async () => {
      expect(isValid(secret, body, digest)).toBe(true)
    })

    test('should return false if the digest does not match', async () => {
      const body = JSON.stringify({ id: 72 })
      expect(isValid(secret, body, digest)).toBe(false)
    })
  })
})

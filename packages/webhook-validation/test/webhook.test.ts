<<<<<<< HEAD
import isValid from '../src/webhook'

jest.mock('crypto', () => ({
  createHmac: jest.fn((algorithm: string, secret: string) => ({
    update: jest.fn((body: string) => ({
      digest: jest.fn(() => {
        if (secret == 'secret' && body == 'body' && algorithm == 'sha256') {
          return 'digest'
        } else {
          return 'notDigest'
        }
      })
    }))
  }))
}))
=======
jest.mock('crypto')

import isValid from '../src/webhook'
import { createHmac } from 'crypto'
>>>>>>> ETSWORK-921 Configure eslint and prettier (jest doesn't seem to be working though)

describe('@workgrid/webhook-validation', () => {
  let secret: string
  let body: string
  let digest: string

  beforeAll(() => {
    secret = 'secret'
    body = 'body'
<<<<<<< HEAD
    digest = 'sha256=digest'
=======
    digest = 'digest'

    const mockDigest = jest.fn(() => digest)
    const mockUpdate = jest.fn(() => ({ digest: mockDigest }))
    createHmac.mockImplementation(() => ({ update: mockUpdate }))
>>>>>>> ETSWORK-921 Configure eslint and prettier (jest doesn't seem to be working though)
  })

  describe('isValid()', () => {
    test('should return true if the digest matches', async () => {
      expect(isValid(secret, body, digest)).toBe(true)
    })

    test('should return false if the digest does not match', async () => {
<<<<<<< HEAD
      secret = 'notSecret'
      body = 'notBody'
=======
      const body = JSON.stringify({ id: 72 })
>>>>>>> ETSWORK-921 Configure eslint and prettier (jest doesn't seem to be working though)
      expect(isValid(secret, body, digest)).toBe(false)
    })
  })
})

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

describe('@workgrid/webhook-validation', () => {
  let secret: string
  let body: string
  let digest: string

  beforeAll(() => {
    secret = 'secret'
    body = 'body'
    digest = 'sha256=digest'
  })

  describe('isValid()', () => {
    test('should return true if the digest matches', async () => {
      expect(isValid(secret, body, digest)).toBe(true)
    })

    test('should return false if the digest does not match', async () => {
      secret = 'notSecret'
      body = 'notBody'
      expect(isValid(secret, body, digest)).toBe(false)
    })
  })
})

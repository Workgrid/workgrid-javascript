import webhookValidation from './webhook-validation'

describe('@workgrid/webhook-validation', () => {
  let secret: string
  let body: string
  let digest: string

  beforeAll(() => {
    secret = 'secret'
    body = JSON.stringify({ id: 1 })
    digest = 'sha256=03def589620c813f198fd03d7967e292b163ef0435ebf43071ce0e9519763cb7'
  })

  test('should return true if the digest matches', async () => {
    expect(webhookValidation(secret, body, digest)).toBe(true)
  })

  test('should return false if the digest does not match', async () => {
    body = JSON.stringify({ id: 2 })
    expect(webhookValidation(secret, body, digest)).toBe(false)
  })
})

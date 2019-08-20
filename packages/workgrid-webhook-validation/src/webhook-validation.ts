import { createHmac } from 'crypto'

/**
 * Determines whether the webhook is valid.
 *
 * @param secret - the client's secret.
 * @param body - the message body sent.
 * @param digest - the post-hash to be compared against.
 * @param algorithm - the hashing algorithm to be used.
 *
 * @beta
 */
export default function webhookValidation(
  secret: string,
  body: string,
  digest: string,
  algorithm: string = 'sha256'
): boolean {
  const hmacSignature = createHmac(algorithm, secret).update(body)
  return `${algorithm}=${hmacSignature.digest('hex')}` === digest
}

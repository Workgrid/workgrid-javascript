import { createHmac } from 'crypto';

/**
* Determines whether the webhook is valid.
*
* @param    secret - the client's secret.
* @param    body - the message body sent.
* @param    digest - the post-hash to be compared against.
*
* @beta
*/
export function isValid(secret : string, body : string, digest : string) : boolean {
    return generateHmacDigest(secret, body) == digest;
}

/**
* Computes the necessary hashing to determine validity of a webhook.
*
* @param    secret - the client's secret.
* @param    body - the message to be hashed with the secret.
* @param    algorithm - the hashing algorithm to be used.
*/
export function generateHmacDigest(secret : string, body : string, algorithm = 'sha256') : string {
    let hmacSignature = createHmac(algorithm, secret).update(body);
    return `${algorithm}=${hmacSignature.digest('hex')}`
}
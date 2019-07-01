import { createHmac } from 'crypto';

/**
* Determines whether the webhook is valid.
*
* @param  body - the message body sent.
* @param  digest - the post-hash to be compared against.
*
* @beta
*/
export function isValid(secret : string, body : string, digest : string) {
    return generateHmacDigest(secret, body) == digest;
}

/**
* Computes the necessary hashing to determine validity of a webhook.
*
* @oparam   secret - the client's secret.
* @param    body - the message to be hashed with the secret.
* @param    algorithm - the hashing algorithm to be used.
*/
export function generateHmacDigest(secret : string, body : string, algorithm = 'sha256') {
    let hmacSignature = createHmac(algorithm, secret).update(body);
    return `${algorithm}=${hmacSignature.digest('hex')}`
}
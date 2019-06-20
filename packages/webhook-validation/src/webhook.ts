import { createHmac } from 'crypto';

/** 
* The Webhook class provides functionality to determine the validity of a webhook.
* @beta
*/
export class Webhook {

    /**
     * The secret shared for this webhook.
     */
    secret : string

    /** 
    * Configures the Webhook with the provided secret.
    */
    constructor(secret: string) {
        this.secret = secret;
    }

    /**
    * Determines whether the webhook is valid.
    *
    * @param  body - the message body sent.
    * @param  digest - the post-hash to be compared against.
    */
    isValid(body : string, digest : string) {
        console.log("Checking body matches digest: %s", digest);
        return generateHmacDigest(this.secret, body) == digest;
    }

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
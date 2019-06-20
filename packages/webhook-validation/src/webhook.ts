import { Client } from "../../client/src/client";
import { createHmac } from 'crypto';

export class Webhook {

    client : Client;

    constructor(client : Client) {
        this.client = client;
    }

    isValid(body : string, digest : string) {
        console.log("Checking body matches digest: %s", digest);
        return generateHmacDigest(this.client.secret, body) == digest;
    }

}

export function generateHmacDigest(secret : string, body : string, algorithm = 'sha256') {
    let hmacSignature = createHmac(algorithm, secret).update(body);
    return `${algorithm}=${hmacSignature.digest('hex')}`
}
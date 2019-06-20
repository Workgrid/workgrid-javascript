import { Webhook, generateHmacDigest } from "../src/webhook";
import { Client } from "../../client/src/client";

describe("testing webhook", () => {
    let client : Client;
    let body : string;
    let digest : string;

    beforeEach(() => {
        client = new Client('beans');
        body = JSON.stringify({ id : 27 });
        digest = generateHmacDigest('beans', body);
    })

    describe("isValid()", () => {
        test('should return true if the digest matches', async () => {
            expect(client.webhook.isValid(body, digest)).toBe(true);
        })

        test('should return false if the digest does not match',  async () => {
            let body = JSON.stringify({ id : 72 });
            expect(client.webhook.isValid(body, digest)).toBe(false);
        })
    })
})
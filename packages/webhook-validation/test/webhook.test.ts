import { Webhook, generateHmacDigest } from "../src/webhook";

describe("Testing Webhook", () => {
    let body : string;
    let digest : string;
    let webhook : Webhook;

    beforeEach(() => {
        webhook = new Webhook("beans");
        body = JSON.stringify({ id : 27 });
        digest = generateHmacDigest('beans', body);
    })

    describe("isValid()", () => {
        test('should return true if the digest matches', async () => {
            expect(webhook.isValid(body, digest)).toBe(true);
        })

        test('should return false if the digest does not match',  async () => {
            let body = JSON.stringify({ id : 72 });
            expect(webhook.isValid(body, digest)).toBe(false);
        })
    })
})
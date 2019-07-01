
import { isValid, generateHmacDigest } from "../src/webhook"

describe("Testing Webhook", () => {
    
    let secret : string;
    let body : string;
    let digest : string;

    beforeAll(() => {
        secret = "beans"
        body = JSON.stringify({ id : 27 });
        digest = generateHmacDigest('beans', body);
    })

    describe("isValid()", () => {
        test('should return true if the digest matches', async () => {
            expect(isValid(secret, body, digest)).toBe(true);
        })

        test('should return false if the digest does not match',  async () => {
            let body = JSON.stringify({ id : 72 });
            expect(isValid(secret, body, digest)).toBe(false);
        })
    })
})
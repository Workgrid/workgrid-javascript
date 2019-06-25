import { OAuth } from "../src/oauth";
import { sign } from 'jsonwebtoken'

describe("Testing Oauth", () => {
    let logger : any = console
    let request : any 
    let oauth : OAuth
    let clientId : string
    let clientSecret : string
    let scope : any
    let tokenUrl : string
    let currentGoodToken = "test"
    beforeEach(() => {
        logger = console
        request = jest.fn(function(){return {data : {access_token: "testAccessToken"}}})
        clientId = 'testClientId'
        clientSecret = 'testSecret'
        scope = 'com.test.api/testifications.all'
        tokenUrl = 'testTokenUrl'
        oauth = new OAuth({logger,request,clientId,clientSecret,scope,tokenUrl});
    })
    describe("oauth", () => {
        test('Not a token is Expired', async () => {
            expect(oauth.isExpired('blahh')).toBe(true);
        })

        test('Expired token is Expired', async () => {
            let access_token = sign({}, 'secret', { expiresIn: '0m' })
            expect(oauth.isExpired(access_token)).toBe(true);
        })

        test('Unexpired token is not expired', async () => {
            let access_token = sign({}, 'secret', { expiresIn: '1m' })
            expect(oauth.isExpired(access_token)).toBe(false);
        })

        test('get access token is successful',  async () => {
            request = jest.fn(function(){return {data : {access_token: "testAccessToken"}}})
            oauth = new OAuth({logger,request,clientId,clientSecret,scope,tokenUrl});
            let test = await oauth.getAccessToken()
            expect(test === "testAccessToken").toBe(true)
        })

        test('get access token catch error',  async () => {
            request = jest.fn(function(){throw new Error("Uh Oh Spaghettios!")})
            oauth = new OAuth({logger,request,clientId,clientSecret,scope,tokenUrl});
            await expect(oauth.getAccessToken()).rejects.toThrow
        })
    })
})
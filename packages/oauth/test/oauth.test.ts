import { OAuth } from "../src/oauth";
import axios from 'axios';

describe("Testing Oauth", () => {
    let logger : any = console
    let request : any = axios
    let oauth : OAuth
    let clientId : string
    let clientSecret : string
    let scope : any
    let tokenUrl : string
    let currentGoodToken = "test"
    beforeEach(() => {
        logger = console
        request = axios
        clientId = 'testClientId'
        clientSecret = 'testSecret'
        scope = 'com.test.api/testifications.all'
        tokenUrl = 'testTokenUrl'
        oauth = new OAuth(logger,request,clientId,clientSecret,scope,tokenUrl);
    })
    describe("oauth", () => {
        test('Not a token is Expired', async () => {
            expect(oauth.isExpired('blahh')).toBe(true);
        })

        test('Expired token is Expired', async () => {
            expect(oauth.isExpired('blahh')).toBe(true);
        })

        test('get access token is successful',  async () => {
            request = jest.fn(function(){return {data : {access_token: "testAccessToken"}}})
            oauth = new OAuth(logger,request,clientId,clientSecret,scope,tokenUrl);
            let test = await oauth.getAccessToken()
            expect(test === "testAccessToken").toBe(true)
        })
    })
})
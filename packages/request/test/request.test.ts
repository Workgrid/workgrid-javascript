
import request, { APIOptions, OAuthOptions } from "../src/request"

import axios from 'axios'
const MockAdapter = require('axios-mock-adapter')

let tokenInvoked : boolean = false

let mock = new MockAdapter(axios)
mock.onAny().reply(config => {
    if (config.url == 'https://auth.code.workgrid.com/oauth2/token') {
        tokenInvoked = true
        const data : string[] = config.data.split("&")
        const id : string = data[1].split("=")[1]
        const secret : string = data[2].split("=")[1]
        if (id == 'will' && secret == 'secret') {
            return [200, { 'access_token' : '24', 'expires_in' : '5000' }]
        } else {
            return [200, { 'access_token' : '25', 'expires_in' : '5000' }]
        }
    } else if (config.url == 'https://code.workgrid.com/v2/jobs') {
        const token : string = config.headers.Authorization.split(" ")[1]
        if (token == '24') {
            return [200, 'Success!']
        } else {
            return [403]
        }
    }
})

describe("@workgrid/request", () => {

    let oauthOptions : OAuthOptions
    let apiOptions : APIOptions

    beforeAll(() => {
        oauthOptions = { client_id : 'will', client_secret : 'secret', scope: '', url : 'https://auth.code.workgrid.com/oauth2/token' }
        apiOptions = { oauthOptions : oauthOptions, url : 'https://code.workgrid.com/v2/jobs', method : 'post' }
    })

    beforeEach(() => {
        tokenInvoked = false
    })

    describe("request()", () => {
        test("should return 'Success!' on successful API call", async () => {
            let response = await request(apiOptions)
            expect(response.data).toBe('Success!')
        })
        test("should throw an error on unsuccessful API call", async () => {
            const newOAuthOptions : OAuthOptions = { client_id : 'notWill', client_secret: 'notSecret', scope: '', url : 'https://auth.code.workgrid.com/oauth2/token'}
            const newAPIOptions : APIOptions = { oauthOptions : newOAuthOptions, url : 'https://code.workgrid.com/v2/jobs', method : 'post' }
            await expect(request(newAPIOptions)).rejects.toThrowError('Request failed with status code 403')
        })
        test("new OAuth token should not be retrieved when current token is still valid", async () => {
            await request(apiOptions)
            expect(tokenInvoked).toBe(false)
        })
    })
})
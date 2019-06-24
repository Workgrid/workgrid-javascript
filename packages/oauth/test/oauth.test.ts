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
    let currentGoodToken = "eyJraWQiOiJYWkRRS0VsVGFUTVpQTE5uSTdPM3N4ZUIzanBcL2c3V0FTXC8yNjRteW9GTzg9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3Z21jbDRlMnA0ZXQwcWxlcmZzOWU5dW5qdCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiY29tLndvcmtncmlkLmFwaVwvbm90aWZpY2F0aW9ucy5hbGwiLCJhdXRoX3RpbWUiOjE1NjEzOTkwNTMsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2d2SXdUbTBTeSIsImV4cCI6MTU2MTQwMjY1MywiaWF0IjoxNTYxMzk5MDUzLCJ2ZXJzaW9uIjoyLCJqdGkiOiJjNTc2MDI0NC0yZDI2LTQ4OTEtYWExNy05MTZjYzUyMmJiOGMiLCJjbGllbnRfaWQiOiI3Z21jbDRlMnA0ZXQwcWxlcmZzOWU5dW5qdCJ9.S26vEz7IYzCrhEOvev3HnuLEKAktw7-GV4IVE5ZcnCEkiz4Rvg1b4x6vJ0F4m0RJs4_jJFvAQOm5xrtIo2efdp9PrGjTh9AtaDUFvCnTJjuQIqcH4r4EUwU_jqFe-gL400YrVNEX_34Ab3NBLLzIgyaqpY9h2SysNI581h2ZWtnz7ToiHaBj3LWdyhsUbOHkAYQui7FyKOvt6mvMZ_WKa5ZYOWlI-NsoFHn89HFRrSDnEcn6xPnxWWyu6x9J-UgatRI4cFSGaGyRz6wFC509LzilT6jrwmkcLPPsyWotX7-2XhqxueBfj2XfzfVtQAuunKS_6C3fcQKqFpqYFX-Bkw"
    beforeEach(() => {
        logger = console
        request = axios
        clientId = '7gmcl4e2p4et0qlerfs9e9unjt'
        clientSecret = '3c06g2lh8nhlh2btkrk8lq8ib4oesa4a06q0a6pon2pibv53i5u'
        scope = 'com.workgrid.api/notifications.all'
        tokenUrl = 'https://auth.workgrid.dev.workgrid.com/oauth2/token'
        oauth = new OAuth(logger,request,clientId,clientSecret,scope,tokenUrl);
    })
    describe("oauth", () => {
        test('Expired is expired', async () => {
            expect(oauth.isExpired('blahh')).toBe(true);
        })

        test('good is good',  async () => {
            expect(oauth.isExpired(currentGoodToken)).toBe(false);
        })
    })
})
/*
describe("Testing Oauth", () => {
    let logger : any = console
    let request : any = axios
    let oauth : OAuth
    let clientId : string
    let clientSecret : string
    let scope : any
    let tokenUrl : string


    beforeEach(() => {
        logger = console
        request = axios
        clientId = 'clientId'
        clientSecret = 'clientSecret'
        scope = 'com.workgrid.api/notifications.all'
        tokenUrl = 'tokenUrl'
        oauth = new OAuth(logger,request,clientId,clientSecret,scope,tokenUrl);

    })

    describe("oauth", () => {
        test('', async () => {
            expect(oauth).toBe(true);
        })

        test('',  async () => {
            expect(!oauth).toBe(false);
        })
    })
})*/
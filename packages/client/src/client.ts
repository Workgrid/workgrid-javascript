import { merge, get, omit } from 'lodash'
import axios from 'axios'

/**
* The Client class represents a client interacting with the Workgrid API.
* @beta
*/
export class Client {

    /**
     * The client's id.
     */
    id : string

    /**
     * The client's current access token.
     */
    token : string = "eyJraWQiOiJYWkRRS0VsVGFUTVpQTE5uSTdPM3N4ZUIzanBcL2c3V0FTXC8yNjRteW9GTzg9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2N21xcm5jaDYzajIycTV0MXJyZmw5dWQyaCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiY29tLndvcmtncmlkLmFwaVwvbm90aWZpY2F0aW9ucy5hbGwiLCJhdXRoX3RpbWUiOjE1NjE0ODI3NTksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2d2SXdUbTBTeSIsImV4cCI6MTU2MTQ4NjM1OSwiaWF0IjoxNTYxNDgyNzU5LCJ2ZXJzaW9uIjoyLCJqdGkiOiI0MzA1MTE5Ny1kNTQ2LTRjZDMtYWNmYS1lYzMyZjVkZDZmNjAiLCJjbGllbnRfaWQiOiI2N21xcm5jaDYzajIycTV0MXJyZmw5dWQyaCJ9.Lxyf7vSVFWPR1dH1ChzDjeDu3aM8pN8EIsd6dq9i3Cot2bKPOPjgXW-d6LoXVEqWf1UqL5B3ScX9aLcxM51EUBCMwprmz_m5kSy4omq65E6bUNuzgqtg99VKlT2Bq6fXlZlyF_y6FcVT14PsfPAzLjNZ4YeHSRcnumDQuan770Cw8q0vVf9VCpNUoECEx3uw9W1nCIxChhH1So2phaXE3TEEFyRvML00xsU3MhEOhgUyGX4bN34Xw8HZAyUuhdWv8vfj33X7BLIkiZzBK0vQbpcwqrcT31M5haQTmJH6jtZRogCCoDVgo4KNVLFRcXrpWfR7lFJrVABxSE6Fmolplw"

    /**
     * The client's secret.
     */
    secret : string

    /**
     * The base URL of the API to hit.
     */
    baseUrl : string

    /**
    * Configures the client.
    * @beta
    */
    constructor(id : string, secret : string, baseUrl : string) {
        this.id = id
        this.secret = secret
        this.baseUrl = baseUrl
    }

    /**
     * Determines if the client's token is valid, and if not obtains a new one.
     * @beta
     */
    ensureToken() {
        return this.token
        // if (!OAuth.isExpired()) {
        //     return this.token;
        // }
        // else {
        //     this.token = await OAuth.getAccessToken();
        // }
    }

    /**
     * Returns a single event from the Workgrid API.
     * @param params - specifies the event to get.
     * @param request - specifies how to make the API call.
     */
    async getEvent(params : { eventId : string }, request : any | null) {
        let apiUrl : string = `events/${params.eventId}`

        return this.callApi(merge({}, { params : params, url : apiUrl, request : request }))
    }

    /**
     * Returns multiple events from the Workgrid API.
     * @param params - specifies how many events to retrieve, the cursor, and the status/types to search by.
     * @param request - specifies how to make the API call.
     */
    async getEvents(params : { limit : number | null, cursor : string, eventStatus : string, eventType : string }, request : any | null ) {
        let apiUrl : string = "events/"

        return this.callApi(merge({}, { params : params, url : apiUrl, request : request }))
    }

    /**
     * Makes the API call from this client to the specified API endpoint with parameters.
     * @param options - the specified options for the API call, including parameters, the type of request to make, the base URL and the api URL to hit
     */
    async callApi(options : { params : any | null, request : any | null, url : string }) {
        await this.ensureToken()
        let headers : any = { authorization : `Bearer ${this.token}`}
        let url = options.url

        try {
            options = merge({}, options, { clientId : this.id, clientSecret : this.secret, params : get(options, 'params') })
            let response : any
            if (options.request) {
                response = await options.request(merge({ headers, url }))
            } else {
                response = await axios(merge({ headers, url}, options))
            }
            if (response.data && response.data.status == "success") {
                return response.data
            } else {
                return Promise.reject(response)
            }
        } catch (err) {
            console.log("Error making get events request: %s", err.message)
            throw err
        }
    }
}
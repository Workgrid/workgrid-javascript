import { merge, get, omit } from 'lodash'
import axios from 'axios'
import pkg from "../package.json"

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
    token : string = ""

    /**
     * The client's secret.
     */
    secret : string

    /**
     * The base URL of the API to hit.
     */
    companyCode : string

    /**
    * Configures the client.
    * @beta
    */
    constructor(id : string, secret : string, companyCode : string) {
        this.id = id
        this.secret = secret
        this.companyCode = companyCode
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
        let url : string = `events/${params.eventId}`

        return this.callApi(merge({}, { url : url, clientId : this.id, clientSecret : this.secret }, { request },
            {scope : 'com.workgrid.api/notifications.all', headers : { 'user-agent': `${pkg.name.replace('/', ':')}/${pkg.version}`}} ))
    }

    /**
     * Returns multiple events from the Workgrid API.
     * @param params - specifies how many events to retrieve, the cursor, and the status/types to search by.
     * @param request - specifies how to make the API call.
     */
    async getEvents(params : { limit : number | null, cursor : string, eventStatus : string, eventType : string }, request : any | null ) {
        let url : string = `/events`

        return this.callApi(merge({}, { url : url, username : this.id, password : this.secret }, { params, request },
            {scope : 'com.workgrid.api/notifications.all', headers : { 'user-agent': `${pkg.name.replace('/', ':')}/${pkg.version}`}} ))
    }

    /**
     * Makes the API call from this client to the specified API endpoint with parameters.
     * @param options - the specified options for the API call, including parameters, the type of request to make, the base URL and the api URL to hit
     */
    async callApi(options : any) {
        await this.ensureToken()
        let headers : any = { authorization : `Bearer ${this.token}`}
        let baseURL = `https://${this.companyCode}.dev.workgrid.com/v2/`

        try {
            options = merge({}, options, { params : get(options, 'params') })
            let response : any
            if (options.request) {
                response = await options.request(merge({ headers, baseURL }, { headers : { 'user-agent': `${pkg.name.replace('/', ':')}/${pkg.version}`}}))
            } else {
                await axios(merge({ method : 'post', headers, baseURL }, { headers : { 'user-agent': `${pkg.name.replace('/', ':')}/${pkg.version}`}}, options, { data : {} }))
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
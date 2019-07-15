import request from "../../request/src/request";

export default class Connector{
    client_id : string
    client_secret : string
    companyCode : string
    token_url : string
    scope : string = 'com.workgrid.api/notifications.all'

    constructor(client_id : string, client_secret : string, companyCode: string){
        this.client_id = client_id
        this.client_secret = client_secret
        this.companyCode = companyCode
        this.token_url = `https://auth.${this.companyCode}.workgrid.com/oauth2/token`
    }

   /**
   * Submit one or more job requests
   * @param {Array<object>} jobs 
   * @return {Promise<object>} - response from API
   */
    async createJobs (jobs:Array<object>) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'post',
            url:`https://${this.companyCode}.workgrid.com/v2/jobs`,
            data: jobs
        })
    }

    /**
   * Submit a single job request
   * @param {object} job 
   * @return {Promise<object>} - response from API
   */
    async createJob(job:object) : Promise<object>{
        return await this.createJobs([job])
    }

   /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get 
   * @return {Promise<object>} - response from API
   */
    async getJob(jobId : string) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:`https://${this.companyCode}.workgrid.com/v2/jobs/${jobId}`
        })
    }
    
   /**
   * Get the job and its current status
   * @param {number} limit - How many items to return
   * @param {string} cursor - An opaque cursor used for pagination
   * @param {string} event Status - Eventstatus to filter by
   * @param {string} eventType - Event type to filter by
   * @return {Promise<object>} - response from API
   */
    async getEvents(eventOptions : { limit : number, cursor : string, eventStatus : string, eventType : string }) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:`https://${this.companyCode}.workgrid.com/v2/events`,
            data: eventOptions
        })
    }

    /**
   * Get the event and its current status
   * @param {string} eventId - jobId of job to get 
   * @return {Promise<object>} - response from API
   */
    async getEvent(eventId:string) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:`https://${this.companyCode}.workgrid.com/v2/events/${eventId}`
        })
    }

    /**
    * Update the status of the event to 'processed'
    * @param {string} eventId - Event to update the status of 
    * @return {Promise<object>} - response from API
    */
    async updateEventStatus(eventId:string) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'put',
            url:`https://${this.companyCode}.workgrid.com/v2/events/${eventId}/status`,
            data:{
                status:'processed'
            }
        })
    }
}

/**
    * create a new Connector object
    * @param {string} client_id - Connector client ID
    * @param {string} client_secret - Connector client secret
    * @param {string} companyCode -  
    * @return {Promise<object>} - response from API
    */
export function createConnector(client_id : string, client_secret : string, companyCode : string) : Connector{
    return new Connector(client_id, client_secret, companyCode)
}

//Placeholder until request PR is approved
export interface OAuthOptions {
    /**
     * The client's id
     */
    client_id: string
  
    /**
     * The client's secret
     */
    client_secret: string
  
    /**
     * The url to get the token from
     */
    url: string
  
    /**
     * The scope the token is for
     */
    scope: string
  }
  
  /**
   * The interface representing the options to be passed in for making an API request.
   *
   * @beta
   */
  export interface APIOptions {
    /**
     * The options necessary for authentication
     */
    oauthOptions: OAuthOptions
  
    /**
     * The type of request to be made (get, post, etc)
     */
    method: string
  
    /**
     * The URL to hit
     */
    url: string
  
    /**
     * The body data to be supplied in the API call
     */
    data?: object
  
    /**
     * The URL parameters to be supplied in the API call
     */
    params?: object
  
    /**
     * Extra options to be supplied to axios
     */
    additionalOptions?: object
  }

  

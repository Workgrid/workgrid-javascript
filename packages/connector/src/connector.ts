//import { request } from "https";

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
        this.token_url = 'https://auth.'+companyCode+'.workgrid.com/oauth2/token'
    }

    async createJobs (jobs:Array<object>) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'post',
            url:'https://acme.workgrid.com/v2/jobs',
            data: jobs
        })
    }

    async createJob(job:object) : Promise<object>{
        return await this.createJobs([job])
    }

    async getJob(jobId : string) : Promise<object>{
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:'https://acme.workgrid.com/v2/jobs/'+jobId
        })
    }
    //how to pass query params?
    async getEvents(limit:number,cursor:string,eventStatus:string,eventType:string){
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:'https://acme.workgrid.com/v2/events',
            data:{
                limit,
                cursor,
                eventStatus,
                eventType
            }
        })
    }

    async getEvent(eventId:string){
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'get',
            url:'https://acme.workgrid.com/v2/events/'+eventId
        })
    }

    async updateEventStatus(eventId:string){
        return await request({
            oauthOptions : {
                client_id : this.client_id,
                client_secret : this.client_secret,
                url : this.token_url,
                scope: this.scope
            },
            method:'put',
            url:'https://acme.workgrid.com/v2/events/{'+eventId+'}/status',
            data:{
                status:'processed'
            }
        })
    }
}

export function createClient(client_id : string, client_secret : string, companyCode : string){
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
  

async function request(apiOptions: APIOptions): Promise<object> {
    return {test:'plaaceholder'}
  }
  

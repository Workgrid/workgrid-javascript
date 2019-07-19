import request, { OAuthOptions } from '@workgrid/request/src/request'

/**
 * A pretty class-wrapper for the request package, allowing for easier interaction with the Workgrid API.
 *
 * @beta
 */
export default class Connector {
  /**
   * The options to be supplied for retrieving an OAuth token
   */
  private oauthOptions: OAuthOptions

  /**
   * The base URL to be used for interacting with the Workgrid API
   */
  private apiBaseURL: string

  public constructor(params: {
    clientId: string
    clientSecret: string
    companyCode: string
    grantType: string
    scopes: string[]
  }) {
    this.oauthOptions = {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      url: `https://auth.${params.companyCode}.workgrid.com/oauth2/token`,
      grantType: params.grantType,
      scopes: params.scopes
    }
    this.apiBaseURL = `https://${params.companyCode}.workgrid.com/`
  }

  /**
   * Submit one or more job requests
   * @param {Array<object>} jobs
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async createJobs(jobs: object[]): Promise<object> {
    return await request({
      oauthOptions: this.oauthOptions,
      method: 'post',
      url: this.apiBaseURL.concat(`v2/jobs`),
      data: jobs
    })
  }

  /**
   * Submit a single job request
   * @param {object} job
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async createJob(job: object): Promise<object> {
    return await this.createJobs([job])
  }

  /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getJob(jobId: string): Promise<object> {
    return await request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/jobs/${jobId}`)
    })
  }

  /**
   * Get information about a set of events
   * @param {number} limit - How many items to return
   * @param {string} cursor - An opaque cursor used for pagination
   * @param {string} event Status - Eventstatus to filter by
   * @param {string} eventType - Event type to filter by
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getEvents(eventOptions: {
    limit: number
    cursor: string
    eventStatus: string
    eventType: string
  }): Promise<object> {
    return await request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/events`),
      data: eventOptions
    })
  }

  /**
   * Get information about a specific event
   * @param {string} eventId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getEvent(eventId: string): Promise<object> {
    return await request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/events/${eventId}`)
    })
  }

  /**
   * Update the status of the event to 'processed'
   * @param {string} eventId - Event to update the status of
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async updateEventStatus(eventId: string): Promise<object> {
    return await request({
      oauthOptions: this.oauthOptions,
      method: 'put',
      url: this.apiBaseURL.concat(`v2/events/${eventId}/status`),
      data: {
        status: 'processed'
      }
    })
  }
}

/**
 * create a new Connector object
 * @param {string} client_id - Connector client ID
 * @param {string} client_secret - Connector client secret
 * @param {string} companyCode - Connector's company code
 * @param {string} grantType - The method of authenticating for an access token
 * @param {string[]} scopes - the scopes of the requested access token
 * @return {Connector} - a new connector object to interact with the Workgrid API with
 *
 * @beta
 */
export function createConnector(params: {
  clientId: string
  clientSecret: string
  companyCode: string
  grantType: string
  scopes: string[]
}): Connector {
  return new Connector(params)
}

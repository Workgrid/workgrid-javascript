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
   * @param {Array<object>} jobs - the jobs to be created by the Workgrid API
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public createJobs(options: { jobs: object[]; params?: object; additionalOptions?: object }): Promise<object> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'post',
      url: this.apiBaseURL.concat(`v2/jobs`),
      data: options.jobs,
      params: options.params,
      additionalOptions: options.additionalOptions
    })
  }

  /**
   * Submit a single job request
   * @param {object} job - the job to be created by the Workgrid API
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public createJob(options: { job: object; params?: object; additionalOptions?: object }): Promise<object> {
    return this.createJobs({
      jobs: [options.job],
      params: options.params,
      additionalOptions: options.additionalOptions
    })
  }

  /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getJob(options: { jobId: string; params?: object; additionalOptions?: object }): Promise<object> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/jobs/${options.jobId}`),
      params: options.params,
      additionalOptions: options.additionalOptions
    })
  }

  /**
   * Get information about a set of events
   * @param {number} limit - How many items to return
   * @param {string} cursor - An opaque cursor used for pagination
   * @param {string} eventStatus - Eventstatus to filter by
   * @param {string} eventType - Event type to filter by
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getEvents(options: {
    eventOptions: {
      limit: number
      cursor: string
      eventStatus: string
      eventType: string
    }
    params?: object
    additionalOptions?: object
  }): Promise<object> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/events`),
      data: options.eventOptions,
      params: options.params,
      additionalOptions: options.additionalOptions
    })
  }

  /**
   * Get information about a specific event
   * @param {string} eventId - jobId of job to get
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getEvent(options: { eventId: string; params?: object; additionalOptions?: object }): Promise<object> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      url: this.apiBaseURL.concat(`v2/events/${options.eventId}`),
      params: options.params,
      additionalOptions: options.additionalOptions
    })
  }

  /**
   * Update the status of the event to 'processed'
   * @param {string} eventId - Event to update the status of
   * @param {object} params - the URL parameters to be supplied in the API call
   * @param {object} additionalOptions - extra options to be supplied to axios
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public updateEventStatus(options: {
    eventId: string
    params?: object
    additionalOptions?: object
  }): Promise<object> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'put',
      url: this.apiBaseURL.concat(`v2/events/${options.eventId}/status`),
      data: {
        status: 'processed'
      },
      params: options.params,
      additionalOptions: options.additionalOptions
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

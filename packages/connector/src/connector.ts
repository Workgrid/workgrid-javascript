import request, { OAuthOptions } from '@workgrid/request/src/request'

interface Status {
  status: number
}

export interface CreateJobResponse extends Status {
  data: {
    jobId: string
    jobType: string
    jobStatus: string
    correlationId: string
  }[]
}

export interface GetJobResponse extends Status {
  data: {
    jobId: string
    jobStatus: string
  }
}

interface EventData {
  eventId: string
  eventType: string
  eventStatus: string
  eventData: {
    action: string
    request: string
  }
  userName: string
  userId: string
  notificationId: string
}

export interface GetEventsResponse extends Status {
  data: EventData[]
}

export interface GetEventResponse extends Status {
  data: EventData
}

export interface UpdateEventResponse extends Status {
  data: {
    eventId: string
    eventStatus: string
  }
}

export type APIResponse =
  | CreateJobResponse
  | GetJobResponse
  | GetEventResponse
  | GetEventsResponse
  | UpdateEventResponse

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

  /**
   * Additional axios options to be specified by the client
   */
  private additionalOptions: object = {}

  public constructor(params: {
    clientId: string
    clientSecret: string
    companyCode: string
    grantType: string
    scopes: string[]
    additionalOptions?: object
  }) {
    this.oauthOptions = {
      clientId: params.clientId,
      clientSecret: params.clientSecret,
      url: `https://auth.${params.companyCode}.workgrid.com/oauth2/token`,
      grantType: params.grantType,
      scopes: params.scopes
    }
    this.apiBaseURL = `https://${params.companyCode}.workgrid.com/`
    if (params.additionalOptions) {
      this.additionalOptions = params.additionalOptions
    }
  }

  /**
   * Submit one or more job requests
   * @param {Array<object>} jobs - the jobs to be created by the Workgrid API
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async createJobs(jobs: object[]): Promise<CreateJobResponse> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'post',
      baseURL: this.apiBaseURL,
      url: 'v2/jobs',
      data: jobs,
      additionalOptions: this.additionalOptions
    }).then((response: object) => {
      const newResponse = response as CreateJobResponse
      return { status: newResponse.status, data: newResponse.data }
    })
  }

  /**
   * Submit a single job request
   * @param {object} job - the job to be created by the Workgrid API
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public createJob(job: object): Promise<CreateJobResponse> {
    return this.createJobs([job])
  }

  /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getJob(jobId: string): Promise<GetJobResponse> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      baseURL: this.apiBaseURL,
      url: `v2/jobs/${jobId}`,
      additionalOptions: this.additionalOptions
    }).then((response: object) => {
      const newResponse = response as GetJobResponse
      return { status: newResponse.status, data: newResponse.data }
    })
  }

  /**
   * Get information about a set of events
   * @param {number} limit - How many items to return
   * @param {string} cursor - An opaque cursor used for pagination
   * @param {string} eventStatus - Eventstatus to filter by
   * @param {string} eventType - Event type to filter by
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getEvents(eventOptions: {
    limit: number
    cursor: string
    eventStatus: string
    eventType: string
  }): Promise<GetEventsResponse> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      baseURL: this.apiBaseURL,
      url: 'v2/events',
      data: eventOptions,
      additionalOptions: this.additionalOptions
    }).then((response: object) => {
      const newResponse = response as GetEventsResponse
      return { status: newResponse.status, data: newResponse.data }
    })
  }

  /**
   * Get information about a specific event
   * @param {string} eventId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public getEvent(eventId: string): Promise<GetEventResponse> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'get',
      baseURL: this.apiBaseURL,
      url: `v2/events/${eventId}`,
      additionalOptions: this.additionalOptions
    }).then((response: object) => {
      const newResponse = response as GetEventResponse
      return { status: newResponse.status, data: newResponse.data }
    })
  }

  /**
   * Update the status of the event to 'processed'
   * @param {string} eventId - Event to update the status of
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public updateEventStatus(eventId: string): Promise<UpdateEventResponse> {
    return request({
      oauthOptions: this.oauthOptions,
      method: 'put',
      baseURL: this.apiBaseURL,
      url: `v2/events/${eventId}/status`,
      data: {
        status: 'processed'
      },
      additionalOptions: this.additionalOptions
    }).then((response: object) => {
      const newResponse = response as UpdateEventResponse
      return { status: newResponse.status, data: newResponse.data }
    })
  }
}

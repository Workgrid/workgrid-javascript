import request, { OAuthOptions } from '@workgrid/request/src/request'
import {
  RequestResponse,
  CreateJobResponse,
  GetJobResponse,
  GetEventResponse,
  UpdateEventResponse
} from '../types/connector'

/**
 * A ConnectorError Object returned when an exception occurs
 *
 * Why: JavaScript throws are not type safe
 */

export class ConnectorError {
  /**
   * The error's name
   */
  public name: string

  /**
   * The error's message
   */
  public message: string

  /**
   * The error's status code
   */
  public status: number

  /**
   * The error's stack trace
   */
  public trace: string

  /**
   * The error object
   */
  public error: object

  public constructor(error: any) {
    this.name = this.getName(error.response.status)
    this.message = error.message
    this.status = error.response.status
    this.trace = error.stack
    this.error = error
  }

  /**
   * Get a custom name for an error of the provided status code
   *
   * @param status - the error's status code
   * @returns {string} - the error's custom name
   */
  private getName(status: number): string {
    if (status === 400) return 'BadRequestException'
    if (status === 401) return 'UnauthorizedException'
    if (status === 404) return 'NotFoundException'
    if (status === 422) return 'UnprocessableEntityException'
    if (status === 500) return 'InternalServerErrorException'
    return 'UnknownException'
  }
}

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
  public async createJobs(jobs: object[]): Promise<CreateJobResponse[] | ConnectorError> {
    try {
      const response = (await request({
        oauthOptions: this.oauthOptions,
        method: 'post',
        baseURL: this.apiBaseURL,
        url: 'v2/jobs',
        data: jobs,
        additionalOptions: this.additionalOptions
      })) as RequestResponse
      return response.data as CreateJobResponse[]
    } catch (error) {
      return new ConnectorError(error)
    }
  }

  /**
   * Submit a single job request
   * @param {object} job - the job to be created by the Workgrid API
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async createJob(job: object): Promise<CreateJobResponse | ConnectorError> {
    const jobResponse = await this.createJobs([job])
    return jobResponse instanceof ConnectorError ? jobResponse : jobResponse[0]
  }

  /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getJob(jobId: string): Promise<GetJobResponse | ConnectorError> {
    try {
      const response = (await request({
        oauthOptions: this.oauthOptions,
        method: 'get',
        baseURL: this.apiBaseURL,
        url: `v2/jobs/${jobId}`,
        additionalOptions: this.additionalOptions
      })) as RequestResponse
      return response.data as GetJobResponse
    } catch (error) {
      return new ConnectorError(error)
    }
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
  public async getEvents(eventOptions: {
    limit: number
    cursor: string
    eventStatus: string
    eventType: string
  }): Promise<GetEventResponse[] | ConnectorError> {
    try {
      const newResponse = (await request({
        oauthOptions: this.oauthOptions,
        method: 'get',
        baseURL: this.apiBaseURL,
        url: 'v2/events',
        data: eventOptions,
        additionalOptions: this.additionalOptions
      })) as RequestResponse
      return newResponse.data as GetEventResponse[]
    } catch (error) {
      return new ConnectorError(error)
    }
  }

  /**
   * Get information about a specific event
   * @param {string} eventId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getEvent(eventId: string): Promise<GetEventResponse | ConnectorError> {
    try {
      const response = (await request({
        oauthOptions: this.oauthOptions,
        method: 'get',
        baseURL: this.apiBaseURL,
        url: `v2/events/${eventId}`,
        additionalOptions: this.additionalOptions
      })) as RequestResponse
      return response.data as GetEventResponse
    } catch (error) {
      return new ConnectorError(error)
    }
  }

  /**
   * Update the status of the event to 'processed'
   * @param {string} eventId - Event to update the status of
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async updateEventStatus(eventId: string): Promise<UpdateEventResponse | ConnectorError> {
    try {
      const response = (await request({
        oauthOptions: this.oauthOptions,
        method: 'put',
        baseURL: this.apiBaseURL,
        url: `v2/events/${eventId}/status`,
        data: {
          status: 'processed'
        },
        additionalOptions: this.additionalOptions
      })) as RequestResponse
      return response.data as UpdateEventResponse
    } catch (error) {
      return new ConnectorError(error)
    }
  }
}

export {
  RequestResponse,
  CreateJobResponse,
  GetJobResponse,
  GetEventResponse,
  UpdateEventResponse
} from '../types/connector'

import request, { OAuthOptions } from '@workgrid/request/src/request'
import {
  RequestResponse,
  CreateJobResponse,
  GetJobResponse,
  GetEventResponse,
  UpdateEventResponse
} from '../types/connector'
import {
  ConnectorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
  UnknownException
} from './connector-exceptions'

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
  public async createJobs(jobs: object[]): Promise<CreateJobResponse[] | ConnectorException> {
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
      return this.generateException(error)
    }
  }

  /**
   * Submit a single job request
   * @param {object} job - the job to be created by the Workgrid API
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async createJob(job: object): Promise<CreateJobResponse | ConnectorException> {
    const jobResponse = await this.createJobs([job])
    return jobResponse instanceof ConnectorException ? jobResponse : jobResponse[0]
  }

  /**
   * Get the job and its current status
   * @param {string} jobId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getJob(jobId: string): Promise<GetJobResponse | ConnectorException> {
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
      return this.generateException(error)
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
  }): Promise<GetEventResponse[] | ConnectorException> {
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
      return this.generateException(error)
    }
  }

  /**
   * Get information about a specific event
   * @param {string} eventId - jobId of job to get
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async getEvent(eventId: string): Promise<GetEventResponse | ConnectorException> {
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
      return this.generateException(error)
    }
  }

  /**
   * Update the status of the event to 'processed'
   * @param {string} eventId - Event to update the status of
   * @return {Promise<object>} - response from API
   *
   * @beta
   */
  public async updateEventStatus(eventId: string): Promise<UpdateEventResponse | ConnectorException> {
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
      return this.generateException(error)
    }
  }

  /**
   * Generates a custom exception object based on the type of the caught error
   *
   * @param error - the caught error object
   * @return {ConnectorException} - a custom exception object
   *
   * @beta
   */
  private generateException(error: any): ConnectorException {
    const status = error.response.status
    if (status === 400) return new BadRequestException(error)
    if (status === 401) return new UnauthorizedException(error)
    if (status === 404) return new NotFoundException(error)
    if (status === 422) return new UnprocessableEntityException(error)
    if (status === 500) return new InternalServerErrorException(error)
    return new UnknownException(error)
  }
}

export { RequestResponse, CreateJobResponse, GetJobResponse, GetEventResponse, UpdateEventResponse }

export {
  ConnectorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
  UnknownException
}

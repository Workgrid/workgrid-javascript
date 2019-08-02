import request, { OAuthOptions, RequestResponse, RequestError } from '@workgrid/request'
import validate from '@workgrid/webhook-validation'
import {
  APIException,
  MissingParameterException,
  NotAllowedValueException,
  TooLargeTitleException,
  ConnectorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
  UnknownException
} from './connector-exceptions'
import { has } from 'lodash'

/**
 * Interface representing successful API response from /v2/jobs
 *
 * @beta
 */
export interface CreateJobResponse {
  /**
   * The job's id
   */
  jobId: string

  /**
   * The job's type
   */
  jobType: string

  /**
   * The job's status
   */
  jobStatus: string

  /**
   * The job's correlation id
   */
  correlationId: string
}

/**
 * Interface representing successful API response from /v2/jobs/{jobId}
 *
 * @beta
 */
export interface GetJobResponse {
  /**
   * The job's id
   */
  jobId: string

  /**
   * The job's status
   */
  jobStatus: string
}

/**
 * Interface representing successful API response from /v2/events or /v2/events/{eventId}
 *
 * @beta
 */
export interface GetEventResponse {
  /**
   * The event's id
   */
  eventId: string

  /**
   * The event's type
   */
  eventType: string

  /**
   * The event's status
   */
  eventStatus: string

  /**
   * The event's data
   */
  eventData: {
    /**
     * The event's action
     */
    action: string

    /**
     * The event's request
     */
    request: string
  }

  /**
   * The event's corresponding username
   */
  userName: string

  /**
   * The event's corresponding user id
   */
  userId: string

  /**
   * The event's corresponding notification id
   */
  notificationId: string
}

/**
 * Interface representing successul API response from /v2/events/{eventId}/status
 *
 * @beta
 */
export interface UpdateEventResponse {
  /**
   * The event's id
   */
  eventId: string

  /**
   * The event's status
   */
  eventStatus: string
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
   * @param jobs - the jobs to be created by the Workgrid API
   * @returns - either information for each created job, or a custom error if a job was unsuccessful
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
   * @param job - the job to be created by the Workgrid API
   * @returns - either information for the created job, or a custom error if it was unsuccessful
   *
   * @beta
   */
  public async createJob(job: object): Promise<CreateJobResponse | ConnectorException> {
    const jobResponse = await this.createJobs([job])
    return jobResponse instanceof ConnectorException ? jobResponse : jobResponse[0]
  }

  /**
   * Get the job and its current status
   * @param jobId - jobId of job to get
   * @returns - either information about the requested job, or a custom error if it was unsuccessful
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
   * @param limit - How many items to return
   * @param cursor - An opaque cursor used for pagination
   * @param eventStatus - Eventstatus to filter by
   * @param eventType - Event type to filter by
   * @returns - either information about a set of events based on filters, or a custom error if it was unsuccessful
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
   * @param eventId - eventId of job to get
   * @returns - either information about a single event, or a custom error if it was unsuccessful
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
   * @param eventId - Event to update the status of
   * @returns - either information about the updated event, or a custom error if it was unsuccessful
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
   * Determines whether the webhook sent to this connector is valid.
   *
   * @param body - the message body sent.
   * @param digest - the post-hash to be compared against.
   * @param algorithm - the hashing algorithm to be used.
   *
   * @beta
   */
  public validateWebhook(body: string, digest: string, algorithm?: string): boolean {
    return validate(this.oauthOptions.clientSecret, body, digest, algorithm)
  }

  /**
   * Generates a custom exception object based on the type of the caught error
   *
   * @param error - the caught error object
   * @returns - a custom exception object
   *
   * @beta
   */
  private generateException(error: Error | RequestError): ConnectorException {
    if (has(error, 'response')) {
      const axiosError = error as RequestError
      const status = axiosError.response && axiosError.response.status
      if (status === 400) return new BadRequestException(axiosError)
      if (status === 401) return new UnauthorizedException(axiosError)
      if (status === 404) return new NotFoundException(axiosError)
      if (status === 422) return new UnprocessableEntityException(axiosError)
      if (status === 500) return new InternalServerErrorException(axiosError)
      return new UnknownException(axiosError)
    } else {
      throw error as Error
    }
  }
}

export {
  APIException,
  MissingParameterException,
  NotAllowedValueException,
  TooLargeTitleException,
  ConnectorException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  UnprocessableEntityException,
  UnknownException
}

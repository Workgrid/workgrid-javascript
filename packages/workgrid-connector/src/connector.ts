/**
 * Copyright 2020 Workgrid Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import request, { OAuthOptions, RequestOptions, RequestResponse /*, RequestError*/ } from './request'
import validate from '@workgrid/webhook-validation'
import { merge } from 'lodash'

export { OAuthOptions, RequestOptions, RequestResponse /*, RequestError*/ }

/**
 * Interface representing a job
 *
 * @beta
 */
export interface Job {
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
 * Interface representing an event
 *
 * @beta
 */
export interface Event {
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
  eventData: unknown
}

/**
 * Interface representing a source
 *
 * @beta
 */
export interface Source {
  /**
   * The source id
   */
  id: string

  /**
   * The source key
   */
  key: string

  /**
   * The source title
   */
  title: string

  /**
   * The source iconUrl
   */
  iconUrl: string

  /**
   * Whether this is the default source
   */
  isDefault: boolean
}

/**
 * Interface representing a category
 *
 * @beta
 */
export interface Category {
  /**
   * The category id
   */
  id: string

  /**
   * The category key
   */
  key: string

  /**
   * The category title
   */
  title: string

  /**
   * The category location
   */
  location: string
}

/**
 * Interface representing Connector parameters
 *
 * @beta
 */
export interface ConnectorConfiguration {
  /**
   * The connector's id
   */
  clientId: string

  /**
   * The connector's secret
   */
  clientSecret: string

  /**
   * The grant type of the OAuth token
   */
  grantType: string

  /**
   * The scopes of the OAuth token
   */
  scopes: string[]
}

/**
 * Interface representing Connector parameters when the company code is supplied
 *
 * @beta
 */
export interface CompanyCodeConfiguration extends ConnectorConfiguration {
  /**
   * The connector's company code
   */
  companyCode: string
}

/**
 * Interface representing Connector parameters when the API/token URLs are supplied
 *
 * @beta
 */
export interface URLConfiguration extends ConnectorConfiguration {
  /**
   * The base API url to hit
   */
  apiUrl: string

  /**
   * The token url to hit
   */
  tokenUrl: string
}

/**
 * A pretty class-wrapper for the request package, allowing for easier interaction with the Workgrid API.
 *
 * @beta
 */
export default class Connector {
  private requestOptions: RequestOptions

  public constructor(params: CompanyCodeConfiguration | URLConfiguration) {
    const { companyCode } = params as CompanyCodeConfiguration

    const defaultApiUrl = companyCode && `https://${companyCode}.workgrid.com`
    const defaultTokenUrl = companyCode && `https://auth.${companyCode}.workgrid.com/oauth2/token`

    const { apiUrl = defaultApiUrl, tokenUrl = defaultTokenUrl } = params as URLConfiguration

    if (!apiUrl) throw new Error('Missing required parameter: apiUrl or companyCode')
    if (!tokenUrl) throw new Error('Missing required parameter: tokenUrl or companyCode')

    const { clientId, clientSecret, grantType, scopes } = params

    if (!clientId) throw new Error('Missing required parameter: clientId')
    if (!clientSecret) throw new Error('Missing required parameter: clientSecret')
    if (!grantType) throw new Error('Missing required parameter: grantType')
    if (!scopes) throw new Error('Missing required parameter: scopes')

    this.requestOptions = {
      clientId,
      clientSecret,
      tokenUrl,
      grantType,
      scopes,
      baseURL: apiUrl,
    }
  }

  /**
   * @beta
   */
  public async request(requestOptions: Partial<RequestOptions>): Promise<RequestResponse> {
    return request(merge({}, this.requestOptions, requestOptions))
  }

  /**
   * Submit one or more job requests
   * @param jobs - the jobs to be created by the Workgrid API
   * @returns information for each created job
   *
   * @beta
   */
  public async createJobs(jobs: unknown[]): Promise<Job[]> {
    const response = await this.request({
      method: 'post',
      url: '/v2/jobs',
      data: jobs,
    })
    return response.data as Job[]
  }

  /**
   * Get the job and its current status
   * @param jobId - jobId of job to get
   * @returns information about the requested job
   *
   * @beta
   */
  public async getJob(jobId: string): Promise<Job> {
    const response = await this.request({
      method: 'get',
      url: `/v2/jobs/${jobId}`,
    })
    return response.data as Job
  }

  /**
   * Get information about a set of events
   * @param limit - How many items to return
   * @param cursor - An opaque cursor used for pagination
   * @param eventStatus - Eventstatus to filter by
   * @param eventType - Event type to filter by
   * @returns information about a set of events based on filters
   *
   * @beta
   */
  public async getEvents(eventOptions?: {
    limit?: number
    cursor?: string
    eventStatus?: string
    eventType?: string
  }): Promise<{ items: Event[]; cursor?: string }> {
    const response = await this.request({
      method: 'get',
      url: '/v2/events',
      params: eventOptions,
    })
    return response.data as { items: Event[]; cursor?: string }
  }

  /**
   * Get information about a specific event
   * @param eventId - eventId of job to get
   * @returns information about a single event
   *
   * @beta
   */
  public async getEvent(eventId: string): Promise<Event> {
    const response = await this.request({
      method: 'get',
      url: `/v2/events/${eventId}`,
    })
    return response.data as Event
  }

  /**
   * Update the status of the event
   * @param eventId - Event to update the status of
   * @param status - The status (likely "processed")
   * @returns information about the updated event
   *
   * @beta
   */
  public async updateEventStatus(eventId: string, status: string): Promise<Event> {
    const response = await this.request({
      method: 'put',
      url: `/v2/events/${eventId}/status`,
      data: { status },
    })
    return response.data as Event
  }

  /**
   * Get information about sources
   * @returns the sources available to the connector
   *
   * @beta
   */
  public async getSources(sourceOptions?: unknown): Promise<{ items: Source[] }> {
    const response = await this.request({
      method: 'get',
      url: '/v2/sources',
      params: sourceOptions,
    })
    return response.data as { items: Source[] }
  }

  /**
   * Get information about categories
   * @param location - The location to filter categories by
   * @returns the categories available to the connector
   *
   * @beta
   */
  public async getCategories(categoryOptions?: { location?: string }): Promise<{ items: Category[] }> {
    const response = await this.request({
      method: 'get',
      url: '/v2/categories',
      params: categoryOptions,
    })
    return response.data as { items: Category[] }
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
    return validate(this.requestOptions.clientSecret, body, digest, algorithm)
  }
}

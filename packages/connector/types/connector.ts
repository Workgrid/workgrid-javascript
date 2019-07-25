/**
 * Basic interface representing API response
 */
export interface RequestResponse {
  data: object
}

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

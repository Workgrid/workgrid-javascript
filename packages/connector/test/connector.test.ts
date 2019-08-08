import Connector, {
  CreateJobResponse,
  GetJobResponse,
  GetEventResponse,
  UpdateEventResponse,
  MissingParameterException,
  NotAllowedValueException,
  TooLargeTitleException,
  BadRequestException,
  ConnectorException,
  NotFoundException,
  UnauthorizedException
} from '../src/connector'
import { APIOptions } from '@workgrid/request'

const createJobResponse = {
  status: 200,
  data: [
    {
      jobId: '123',
      jobType: 'notification.create',
      jobStatus: 'processed',
      correlationId: 'xyz'
    }
  ]
}
const id = '1'
const getJobResponse = { status: 200, data: { jobId: id, jobStatus: 'processing' } }
const getEventsResponse = {
  status: 200,
  data: [
    {
      eventId: '123',
      eventType: 'Notification.Action',
      eventStatus: 'processed',
      eventData: { action: 'approve', request: '000' },
      userName: 'will',
      userId: '456',
      notificationId: '789'
    }
  ]
}
const getEventResponse = { status: 200, data: getEventsResponse.data[0] }
const updateEventResponse = { status: 200, data: { eventId: id, eventStatus: 'processed' } }

const badRequestResponse = { response: { status: 400, data: {} } }
const notFoundResponse = { response: { status: 404, data: {} } }
const unauthorizedResponse = { response: { status: 401, data: {} } }

const notAllowedValueData = { errors: [{ message: 'should be equal to one of the allowed values' }] }
const titleTooLongData = { errors: [{ message: 'Notification title size is greater than max 5' }] }
const missingParameterData = { errors: [{ message: "should have required property 'title'" }] }

jest.mock('@workgrid/request', () => {
  return (options: APIOptions): Promise<object> => {
    if (
      options.oauthOptions.clientId == 'will' &&
      options.oauthOptions.clientSecret == 'secret' &&
      options.oauthOptions.url == 'https://auth.code.workgrid.com/oauth2/token'
    ) {
      if (options.url === 'v2/jobs') {
        const error = Object.assign({}, badRequestResponse)
        const title = (options.data as { title: string }[])[0].title
        if (!title) {
          error.response.data = missingParameterData
          return Promise.reject(error)
        } else if (title.length > 5) {
          error.response.data = titleTooLongData
          return Promise.reject(error)
        } else {
          return Promise.resolve(createJobResponse)
        }
      } else if (options.url == `v2/jobs/${id}`) {
        return Promise.resolve(getJobResponse)
      } else if (options.url == 'v2/events') {
        const error = Object.assign({}, badRequestResponse)
        const eventStatus = (options.data as { eventStatus: string }).eventStatus
        if (eventStatus !== 'processed') {
          error.response.data = notAllowedValueData
          return Promise.reject(error)
        } else {
          return Promise.resolve(getEventsResponse)
        }
      } else if (options.url == `v2/events/${id}`) {
        return Promise.resolve(getEventResponse)
      } else if (options.url == `v2/events/${id}/status`) {
        return Promise.resolve(updateEventResponse)
      } else {
        return Promise.reject(notFoundResponse)
      }
    } else {
      return Promise.reject(unauthorizedResponse)
    }
  }
})

describe('@connector', (): void => {
  let connector: Connector
  let createJobData: { title: string }
  let eventOptions: { limit: number; cursor: string; eventStatus: string; eventType: string }

  beforeAll(() => {
    const options = {
      clientId: 'will',
      clientSecret: 'secret',
      companyCode: 'code',
      grantType: 'client_credentials',
      scopes: ['com.workgrid.api/notifications.all']
    }
    connector = new Connector(options)
    createJobData = { title: 'title' }
    eventOptions = {
      limit: 1,
      cursor: '',
      eventStatus: 'processed',
      eventType: 'Notification.Action'
    }
  })

  test('createJobs returns expected data on successful call', async () => {
    const createJobsOutput: CreateJobResponse[] | ConnectorException = await connector.createJobs([createJobData])
    expect(createJobsOutput).toEqual(createJobResponse.data)
  })

  test('createJob is equivalent to createJobs when given a single job', async () => {
    const createJobOutput: CreateJobResponse | ConnectorException = (await connector.createJob(
      createJobData
    )) as CreateJobResponse
    const createJobsOutput: CreateJobResponse[] | ConnectorException = (await connector.createJobs([
      createJobData
    ])) as CreateJobResponse[]
    expect(createJobOutput).toEqual(createJobsOutput[0])
  })

  test('getJob returns expected data on successful call', async () => {
    const getJobOutput: GetJobResponse | ConnectorException = await connector.getJob(id)
    expect(getJobOutput).toEqual(getJobResponse.data)
  })

  test('getEvents returns expected data on successful call', async () => {
    const getEventsOutput: GetEventResponse[] | ConnectorException = await connector.getEvents(eventOptions)
    expect(getEventsOutput).toEqual(getEventsResponse.data)
  })

  test('getEvent returns expected data on successful call', async () => {
    const getEventOutput: GetEventResponse | ConnectorException = await connector.getEvent(id)
    expect(getEventOutput).toEqual(getEventResponse.data)
  })

  test('updateEventStatus returns expected data on successful call', async () => {
    const updateEventStatusOutput: UpdateEventResponse | ConnectorException = await connector.updateEventStatus(id)
    expect(updateEventStatusOutput).toEqual(updateEventResponse.data)
  })

  test('hitting incorrect endpoint results in not found exception', async () => {
    const response: GetJobResponse | ConnectorException = await connector.getJob(id + 1)
    expect(response).toBeInstanceOf(NotFoundException)
  })

  test('incorrect OAuth configurations results in unauthorized exception', async () => {
    const options = {
      clientId: 'notWill',
      clientSecret: 'notSecret',
      companyCode: 'code',
      grantType: 'client_credentials',
      scopes: ['com.workgrid.api/notifications.all']
    }
    const badConnector = new Connector(options)
    const response: GetEventResponse | ConnectorException = await badConnector.getEvent(id)
    expect(response).toBeInstanceOf(UnauthorizedException)
  })

  test('too large title results in too large title exception', async () => {
    const response: GetJobResponse | ConnectorException = await connector.createJob({ title: 'titles' })
    expect(response).toBeInstanceOf(BadRequestException)
    const error = response as ConnectorException
    expect(error.errors[0]).toBeInstanceOf(TooLargeTitleException)
  })

  test('missing required parameter results in missing parameter exception', async () => {
    const response: CreateJobResponse | ConnectorException = await connector.createJob({})
    expect(response).toBeInstanceOf(BadRequestException)
    const error = response as ConnectorException
    expect(error.errors[0]).toBeInstanceOf(MissingParameterException)
  })

  test('not passing in required data field value results in not allowed value exception', async () => {
    const badGetEventsOptions = { limit: 1, cursor: '', eventStatus: 'notProcessed', eventType: 'Notification.Action' }
    const response: GetEventResponse[] | ConnectorException = await connector.getEvents(badGetEventsOptions)
    expect(response).toBeInstanceOf(BadRequestException)
    const error = response as ConnectorException
    expect(error.errors[0]).toBeInstanceOf(NotAllowedValueException)
  })
})

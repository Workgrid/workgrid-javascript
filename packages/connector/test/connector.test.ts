import Connector, {
  CreateJobResponse,
  GetJobResponse,
  GetEventResponse,
  UpdateEventResponse,
  BadRequestException,
  ConnectorException,
  NotFoundException,
  UnauthorizedException
} from '../src/connector'
import { APIOptions } from '@workgrid/request/src/request'

const createJobResponse = {
  status: 200,
  data: {
    jobId: '123',
    jobType: 'notification.create',
    jobStatus: 'processed',
    correlationId: 'xyz'
  }
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

const badRequestResponse = { response: { status: 400, message: 'Bad request', stack: '', data: { errors: [] } } }
const notFoundResponse = { response: { status: 404, message: 'Endpoint not found', stack: '', data: { errors: [] } } }
const unauthorizedResponse = { response: { status: 401, message: 'Unauthorized', stack: '', data: { errors: [] } } }

jest.mock('@workgrid/request/src/request', () => {
  return {
    default: (options: APIOptions): Promise<object> => {
      if (
        options.oauthOptions.clientId == 'will' &&
        options.oauthOptions.clientSecret == 'secret' &&
        options.oauthOptions.url == 'https://auth.code.workgrid.com/oauth2/token'
      ) {
        if (options.url === 'v2/jobs') {
          if ((options.data as { data: string }[])[0].data) {
            return Promise.resolve(createJobResponse)
          } else {
            return Promise.reject(badRequestResponse)
          }
        } else if (options.url == `v2/jobs/${id}`) {
          return Promise.resolve(getJobResponse)
        } else if (options.url == 'v2/events') {
          return Promise.resolve(getEventsResponse)
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
  }
})

describe('@connector', (): void => {
  let connector: Connector
  let createJobData: { data: string }
  let eventData: { limit: number; cursor: string; eventStatus: string; eventType: string }

  beforeAll(() => {
    const options = {
      clientId: 'will',
      clientSecret: 'secret',
      grantType: 'client_credentials',
      scopes: ['com.workgrid.api/notifications.all']
    }
    connector = new Connector({
      companyCode: 'code',
      ...options
    })
    createJobData = { data: 'data' }
    eventData = {
      limit: 1,
      cursor: '',
      eventStatus: 'processed',
      eventType: 'Notification.Action'
    }
  })

  test('createJobs forms correct options on call', async () => {
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

  test('getJob forms correct options on call', async () => {
    const getJobOutput: GetJobResponse | ConnectorException = await connector.getJob(id)
    expect(getJobOutput).toEqual(getJobResponse.data)
  })

  test('getEvents forms correct options on call', async () => {
    const getEventsOutput: GetEventResponse[] | ConnectorException = await connector.getEvents(eventData)
    expect(getEventsOutput).toEqual(getEventsResponse.data)
  })

  test('getEvent forms correct options on call', async () => {
    const getEventOutput: GetEventResponse | ConnectorException = await connector.getEvent(id)
    expect(getEventOutput).toEqual(getEventResponse.data)
  })

  test('updateEventStatus forms correct options on call', async () => {
    const updateEventStatusOutput: UpdateEventResponse | ConnectorException = await connector.updateEventStatus(id)
    expect(updateEventStatusOutput).toEqual(updateEventResponse.data)
  })

  test('sending unexpected data results in bad request exception', async () => {
    const response: CreateJobResponse | ConnectorException = await connector.createJob({})
    expect(response).toBeInstanceOf(BadRequestException)
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
})

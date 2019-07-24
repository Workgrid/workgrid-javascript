import Connector, { CreateJobResponse, GetJobResponse, GetEventResponse, UpdateEventResponse } from '../src/connector'

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
const errorResponse = { status: 400, message: 'Bad call' }

jest.mock('@workgrid/request/src/request', () => {
  return {
    default: (options: { url: string }): Promise<object> => {
      if (options.url === 'v2/jobs') {
        return Promise.resolve(createJobResponse)
      } else if (options.url == `v2/jobs/${id}`) {
        return Promise.resolve(getJobResponse)
      } else if (options.url == 'v2/events') {
        return Promise.resolve(getEventsResponse)
      } else if (options.url == `v2/events/${id}`) {
        return Promise.resolve(getEventResponse)
      } else if (options.url == `v2/events/${id}/status`) {
        return Promise.resolve(updateEventResponse)
      } else {
        return Promise.reject(errorResponse)
      }
    }
  }
})

describe('@connector', (): void => {
  let connector: Connector
  let jobData: object
  let eventOptions: { limit: number; cursor: string; eventStatus: string; eventType: string }

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
    jobData = {}
    eventOptions = {
      limit: 1,
      cursor: '',
      eventStatus: 'processed',
      eventType: 'Notification.Action'
    }
  })

  test('createJobs forms correct options on call', async () => {
    const createJobsOutput: CreateJobResponse[] = await connector.createJobs([jobData])
    expect(createJobsOutput).toEqual(createJobResponse.data)
  })

  test('createJob is equivalent to createJobs when given a single job', async () => {
    const createJobOutput: CreateJobResponse = await connector.createJob(jobData)
    const createJobsOutput: CreateJobResponse[] = await connector.createJobs([jobData])
    expect(createJobOutput).toEqual(createJobsOutput[0])
  })

  test('getJob forms correct options on call', async () => {
    const getJobOutput: GetJobResponse = await connector.getJob(id)
    expect(getJobOutput).toEqual(getJobResponse.data)
  })

  test('getEvents forms correct options on call', async () => {
    const getEventsOutput: GetEventResponse[] = await connector.getEvents(eventOptions)
    expect(getEventsOutput).toEqual(getEventsResponse.data)
  })

  test('getEvent forms correct options on call', async () => {
    const getEventOutput: GetEventResponse = await connector.getEvent(id)
    expect(getEventOutput).toEqual(getEventResponse.data)
  })

  test('updateEventStatus forms correct options on call', async () => {
    const updateEventStatusOutput: UpdateEventResponse = await connector.updateEventStatus(id)
    expect(updateEventStatusOutput).toEqual(updateEventResponse.data)
  })
})

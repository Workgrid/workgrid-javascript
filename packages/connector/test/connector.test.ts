import Connector from '../src/connector'
import { OAuthOptions } from '@workgrid/request/src/request'

jest.mock('@workgrid/request/src/request', () => {
  return {
    default: (options: object): Promise<object> => {
      return Promise.resolve(options)
    }
  }
})

describe('@connector', (): void => {
  let connector: Connector
  let oauthOptions: OAuthOptions
  let id: string
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
    oauthOptions = {
      url: 'https://auth.code.workgrid.com/oauth2/token',
      ...options
    }
    id = '1'
    jobData = {}
    eventOptions = {
      limit: 50,
      cursor: '',
      eventStatus: 'processed',
      eventType: 'Notification.Action'
    }
  })

  test('createJobs forms correct options on call', async () => {
    const createJobsOutput = await connector.createJobs({ jobs: [jobData] })
    expect(createJobsOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'post',
      url: 'https://code.workgrid.com/v2/jobs',
      data: [{}]
    })
  })

  test('createJob is equivalent to createJobs when given a single job', async () => {
    const createJobOutput = await connector.createJob({ job: jobData })
    const createJobsOutput = await connector.createJobs({ jobs: [jobData] })
    expect(createJobOutput).toEqual(createJobsOutput)
  })

  test('getJob forms correct options on call', async () => {
    const getJobOutput = await connector.getJob({ jobId: id })
    expect(getJobOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      url: `https://code.workgrid.com/v2/jobs/${id}`
    })
  })

  test('getEvents forms correct options on call', async () => {
    const getEventsOutput = await connector.getEvents({ eventOptions: eventOptions })
    expect(getEventsOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      url: `https://code.workgrid.com/v2/events`,
      data: eventOptions
    })
  })

  test('getEvent forms correct options on call', async () => {
    const getEventOutput = await connector.getEvent({ eventId: id })
    expect(getEventOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      url: `https://code.workgrid.com/v2/events/${id}`
    })
  })

  test('updateEventStatus forms correct options on call', async () => {
    const updateEventStatusOutput = await connector.updateEventStatus({ eventId: id })
    expect(updateEventStatusOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'put',
      url: `https://code.workgrid.com/v2/events/${id}/status`,
      data: {
        status: 'processed'
      }
    })
  })
})

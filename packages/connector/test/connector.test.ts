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
    const createJobsOutput = await connector.createJobs([jobData])
    expect(createJobsOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'post',
      baseURL: 'https://code.workgrid.com/',
      url: 'v2/jobs',
      data: [jobData],
      additionalOptions: {}
    })
  })

  test('createJob is equivalent to createJobs when given a single job', async () => {
    const createJobOutput = await connector.createJob(jobData)
    const createJobsOutput = await connector.createJobs([jobData])
    expect(createJobOutput).toEqual(createJobsOutput)
  })

  test('getJob forms correct options on call', async () => {
    const getJobOutput = await connector.getJob(id)
    expect(getJobOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      baseURL: 'https://code.workgrid.com/',
      url: `v2/jobs/${id}`,
      additionalOptions: {}
    })
  })

  test('getEvents forms correct options on call', async () => {
    const getEventsOutput = await connector.getEvents(eventOptions)
    expect(getEventsOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      baseURL: `https://code.workgrid.com/`,
      url: 'v2/events',
      data: eventOptions,
      additionalOptions: {}
    })
  })

  test('getEvent forms correct options on call', async () => {
    const getEventOutput = await connector.getEvent(id)
    expect(getEventOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'get',
      baseURL: 'https://code.workgrid.com/',
      url: `v2/events/${id}`,
      additionalOptions: {}
    })
  })

  test('updateEventStatus forms correct options on call', async () => {
    const updateEventStatusOutput = await connector.updateEventStatus(id)
    expect(updateEventStatusOutput).toEqual({
      oauthOptions: oauthOptions,
      method: 'put',
      baseURL: 'https://code.workgrid.com/',
      url: `v2/events/${id}/status`,
      data: {
        status: 'processed'
      },
      additionalOptions: {}
    })
  })
})

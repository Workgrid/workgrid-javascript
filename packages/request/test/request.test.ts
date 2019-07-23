import request, { APIOptions, OAuthOptions } from '../src/request'

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

let tokenInvoked = false
const jobResponse = 'Success!'

const mock = new MockAdapter(axios)
mock.onAny().reply((config: any) => {
  if (config.url == 'https://auth.code.workgrid.com/oauth2/token') {
    tokenInvoked = true
    const data: string[] = config.data.split('&')
    const id: string = data[0].split('=')[1]
    const secret: string = data[1].split('=')[1]
    if (id == 'will' && secret == 'secret') {
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      return [200, { access_token: '24', expires_in: '5000' }]
    } else {
      /* eslint-disable-next-line @typescript-eslint/camelcase */
      return [200, { access_token: '25', expires_in: '5000' }]
    }
  } else {
    const token: string = config.headers.Authorization.split(' ')[1]
    if (token == '24') {
      return [200, jobResponse]
    } else {
      return [403]
    }
  }
})

describe('@workgrid/request', () => {
  let oauthOptions: OAuthOptions
  let apiOptions: APIOptions

  beforeAll(() => {
    oauthOptions = {
      clientId: 'will',
      clientSecret: 'secret',
      scopes: ['com.workgrid.api/notifications.all'],
      url: 'https://auth.code.workgrid.com/oauth2/token',
      grantType: 'client_credentials'
    }
    apiOptions = { oauthOptions: oauthOptions, baseURL: 'https://code.workgrid.com/', url: 'v2/jobs', method: 'post' }
  })

  beforeEach(() => {
    tokenInvoked = false
  })

  describe('request()', () => {
    test("should return 'Success!' on successful API call", async () => {
      const response: any = await request(apiOptions)
      expect(response.data).toStrictEqual(jobResponse)
    })
    test('should throw an error on unsuccessful API call', async () => {
      const newOauthOptions = Object.assign({}, oauthOptions)
      newOauthOptions.clientId = 'notWill'
      newOauthOptions.clientSecret = 'notSecret'
      const newAPIOptions = Object.assign({}, apiOptions)
      newAPIOptions.oauthOptions = newOauthOptions
      await expect(request(newAPIOptions)).rejects.toThrowError('Request failed with status code 403')
    })
    test('new OAuth token should not be retrieved when current token is still valid', async () => {
      await request(apiOptions)
      expect(tokenInvoked).toBe(false)
    })
  })
})

import request, { RequestOptions } from './request'

import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mockedAdapter = new MockAdapter(axios)

describe('@workgrid/request', () => {
  let requestOptions: RequestOptions

  beforeEach(() => {
    mockedAdapter.reset()

    requestOptions = {
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scopes: ['com.workgrid.api/notifications.all'],
      tokenUrl: 'https://auth.acme.workgrid.com/oauth2/token',
      grantType: 'client_credentials',
      baseURL: 'https://acme.workgrid.com/',

      // axios-mock-adapter expects url to always be defined...
      url: '',
    }
  })

  test('will throw if oauth returns a 401', async () => {
    mockedAdapter.onPost(requestOptions.tokenUrl).replyOnce(401)

    const promise = request(requestOptions)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Request failed with status code 401"`)
  })

  test('will throw if request returns a 401', async () => {
    mockedAdapter.onPost(requestOptions.tokenUrl).replyOnce(200, {})
    mockedAdapter.onGet(requestOptions.baseURL).replyOnce(401)

    const promise = request(requestOptions)
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"Request failed with status code 401"`)
  })

  test('will resolve to a successful response on 200', async () => {
    mockedAdapter.onPost(requestOptions.tokenUrl).replyOnce(200, {})
    mockedAdapter.onGet(requestOptions.baseURL).replyOnce(200, {})

    const promise = request(requestOptions)
    await expect(promise).resolves.toEqual(expect.objectContaining({ status: 200, data: {} }))
  })

  test('will request new oauth tokes when they expire', async () => {
    const createOauthResponse = jest.fn(() => ({ expires_in: 0 }))

    mockedAdapter.onPost(requestOptions.tokenUrl).reply(() => [200, createOauthResponse()])
    mockedAdapter.onGet(requestOptions.baseURL).reply(() => [200, {}])

    await request(requestOptions)
    await request(requestOptions)

    expect(createOauthResponse).toHaveBeenCalledTimes(2)
  })

  test('will reuse oauth tokes while they are valid', async () => {
    const createOauthResponse = jest.fn(() => ({ expires_in: 5000 }))

    mockedAdapter.onPost(requestOptions.tokenUrl).reply(() => [200, createOauthResponse()])
    mockedAdapter.onGet(requestOptions.baseURL).reply(() => [200, {}])

    await request(requestOptions)
    await request(requestOptions)

    expect(createOauthResponse).toHaveBeenCalledTimes(1)
  })
})

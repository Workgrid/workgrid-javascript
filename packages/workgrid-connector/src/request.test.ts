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

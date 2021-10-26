/**
 * Copyright 2021 Workgrid Software
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

// jest.mock('@workgrid/client')

import { createElement as h } from 'react'
import { renderHook as _renderHook, RenderHookOptions } from '@testing-library/react-hooks'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

import WorkgridClient from '@workgrid/client'

import {
  WorkgridProvider,
  useWorkgridClient,
  useQuery,
  useMutation,
  useCustomQuery,
  useCustomMutation,
} from './client-react'

const server = setupServer(
  rest.get(`https://company-code.workgrid.com/v1/usernotifications/:id`, (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, title: `${req.method} ${req.url.pathname}` }))
  }),
  rest.put(`https://company-code.workgrid.com/v1/usernotifications/:id/view`, (req, res, ctx) => {
    return res(ctx.json({ data: { id: req.params.id, title: `${req.method} ${req.url.pathname}` } }))
  })
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('@workgrid/client-react', () => {
  let client: WorkgridClient
  let renderHook: typeof _renderHook

  beforeEach(() => {
    client = new WorkgridClient({
      context: {
        userAgent: 'user-agent',
        token: 'token',
        companyCode: 'company-code',
      },
    })

    renderHook = <TProps, TResult>(callback: (props: TProps) => TResult, options?: RenderHookOptions<TProps>) => {
      return _renderHook(callback, { wrapper: (props) => h(WorkgridProvider, { client, ...props }), ...options })
    }
  })

  describe('useWorkgridClient', () => {
    test('will throw if used outside a WorkgirdProvider', () => {
      const { result } = renderHook(() => useWorkgridClient(), { wrapper: undefined })

      expect(result.error).toMatchInlineSnapshot(`[Error: useWorkgridClient must be within a WorkgridProvider]`)
    })

    test('will return the workgrid client', () => {
      const { result } = renderHook(() => useWorkgridClient())

      expect(result.current).toEqual(client)
    })
  })

  describe('useQuery', () => {
    test('will throw if used outside a WorkgirdProvider', () => {
      const { result } = renderHook(() => useQuery(['getNotification', { spaceId: 'space-id', id: '1234' }]), {
        wrapper: undefined,
      })

      expect(result.error).toMatchInlineSnapshot(`[Error: useQuery must be within a WorkgridProvider]`)
    })

    test('will prepare and execute the query', async () => {
      const { result, waitFor } = renderHook(() => useQuery(['getNotification', { spaceId: 'space-id', id: '1234' }]))

      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "GET /v1/usernotifications/1234",
        }
      `)
    })
  })

  describe('useCustomQuery', () => {
    test('will throw if used outside a WorkgirdProvider', () => {
      const { result } = renderHook(() => useCustomQuery('query-key'), { wrapper: undefined })

      expect(result.error).toMatchInlineSnapshot(`[Error: useCustomQuery must be within a WorkgridProvider]`)
    })

    test('will prepare and execute the query', async () => {
      const options = { queryFn: () => ({ message: 'useCustomQuery' }) }
      const { result, waitFor } = renderHook(() => useCustomQuery('query-key', options))

      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toMatchInlineSnapshot(`
        Object {
          "message": "useCustomQuery",
        }
      `)
    })
  })

  describe('useMutation', () => {
    test('will throw if used outside a WorkgirdProvider', () => {
      const { result } = renderHook(() => useMutation('notificationViewed'), { wrapper: undefined })

      expect(result.error).toMatchInlineSnapshot(`[Error: useMutation must be within a WorkgridProvider]`)
    })

    test('will prepare and execute the mutation', async () => {
      const { result, waitFor } = renderHook(() => useMutation('notificationViewed'))

      expect(result.current.isIdle).toBe(true)

      result.current.mutate({ spaceId: 'space-id', id: '1234' })

      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "PUT /v1/usernotifications/1234/view",
        }
      `)
    })
  })

  describe('useCustomMutation', () => {
    test('will throw if used outside a WorkgirdProvider', () => {
      const { result } = renderHook(() => useCustomMutation('mutation-key'), { wrapper: undefined })

      expect(result.error).toMatchInlineSnapshot(`[Error: useCustomMutation must be within a WorkgridProvider]`)
    })

    test('will prepare and execute the mutation', async () => {
      const options = { mutationFn: async () => ({ message: 'useCustomMutation' }) }
      const { result, waitFor } = renderHook(() => useCustomMutation('mutation-key', options))

      expect(result.current.isIdle).toBe(true)

      result.current.mutate(undefined)

      await waitFor(() => result.current.isSuccess)

      expect(result.current.data).toMatchInlineSnapshot(`
        Object {
          "message": "useCustomMutation",
        }
      `)
    })
  })
})

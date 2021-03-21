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

import { setupServer } from 'msw/node'
import { rest } from 'msw'

import WorkgridClient from './client'

const server = setupServer(
  rest.get(`https://company-code.workgrid.com/v1/toknow`, (req, res, ctx) => {
    return res(ctx.json({ data: { notifications: [{ title: `${req.method} ${req.url.pathname}` }] } }))
  }),
  rest.get(`https://company-code.workgrid.com/v1/usernotifications/:id`, (req, res, ctx) => {
    return res(ctx.json({ data: { id: req.params.id, title: `${req.method} ${req.url.pathname}` } }))
  }),
  rest.post(`https://company-code.workgrid.com/v1/usernotifications/:id/action`, (req, res, ctx) => {
    return res(ctx.json({ data: { id: req.params.id, title: `${req.method} ${req.url.pathname}` } }))
  }),
  rest.delete(`https://company-code.workgrid.com/v1/usernotifications/:id`, (req, res, ctx) => {
    return res(ctx.json({ data: { id: req.params.id, title: `${req.method} ${req.url.pathname}` } }))
  }),
  rest.get(`https://company-code.workgrid.com/v1/activity`, (req, res, ctx) => {
    return res(ctx.json({ data: { activity: [{ title: `${req.method} ${req.url.pathname}` }] } }))
  }),
  rest.get(`https://company-code.workgrid.com/v1/microapps`, (req, res, ctx) => {
    return res(ctx.json({ data: { apps: [{ title: `${req.method} ${req.url.pathname}` }] } }))
  }),
  rest.put(`https://company-code.workgrid.com/v1/usernotifications/:id/view`, (req, res, ctx) => {
    return res(ctx.json({ data: { id: req.params.id, title: `${req.method} ${req.url.pathname}` } }))
  }),
  rest.put(`https://company-code.workgrid.com/v1/usernotifications/:id/view-detail`, (req, res, ctx) => {
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

describe('@workgrid/client', () => {
  let client: WorkgridClient

  beforeEach(() => {
    client = new WorkgridClient({ context: { token: 'token', spaceId: 'space-id', companyCode: 'company-code' } })
  })

  test('query', async () => {
    const result = await client.query(['getNotification', '1234'])

    expect(result).toMatchInlineSnapshot(`
      Object {
        "id": "1234",
        "title": "GET /v1/usernotifications/1234",
      }
    `)
  })

  test('customQuery', async () => {
    const options = { queryFn: () => ({ message: 'Hello, world!' }) }
    const result = await client.customQuery('query-key', options)

    expect(result).toMatchInlineSnapshot(`
      Object {
        "message": "Hello, world!",
      }
    `)
  })

  test('mutate', async () => {
    const result = await client.mutate('notificationViewed', { id: '1234' })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "id": "1234",
        "title": "PUT /v1/usernotifications/1234/view",
      }
    `)
  })

  test('customMutate', async () => {
    const options = { mutationFn: async () => ({ message: 'Hello, world!' }) }
    const result = client.customMutate('mutation-key', undefined, options)

    expect(result).toMatchInlineSnapshot(`Promise {}`)
  })

  describe('queries & mutations', () => {
    test('getNotifications', async () => {
      const result = await client.query(['getNotifications', { location: 'toknow' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/toknow",
          },
        ]
      `)
    })

    test('getNotification', async () => {
      const result = await client.query(['getNotification', '1234'])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "GET /v1/usernotifications/1234",
        }
      `)
    })

    test('actionNotification', async () => {
      const result = await client.mutate('actionNotification', { id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "POST /v1/usernotifications/1234/action",
        }
      `)
    })

    test('deleteNotification', async () => {
      const result = await client.mutate('deleteNotification', { id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "DELETE /v1/usernotifications/1234",
        }
      `)
    })

    test('getActivity', async () => {
      const result = await client.query(['getActivity'])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/activity",
          },
        ]
      `)
    })

    test('getApps', async () => {
      const result = await client.query(['getApps'])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/microapps",
          },
        ]
      `)
    })

    test('notificationViewed', async () => {
      const result = await client.mutate('notificationViewed', { id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "PUT /v1/usernotifications/1234/view",
        }
      `)
    })

    test('notificationDetailViewed', async () => {
      const result = await client.mutate('notificationViewed', { id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "PUT /v1/usernotifications/1234/view",
        }
      `)
    })
  })
})
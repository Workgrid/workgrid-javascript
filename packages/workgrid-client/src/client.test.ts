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
  rest.get(`https://company-code.workgrid.com/v1/discover`, (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          {
            botId: 'botId',
            botAliasId: 'botAliasId',
            locale: 'en_US',
            title: 'Conversational App Title',
            from: { name: 'Name of Conversational App', iconUrl: 'Url of the Conversational App icon' },
            intents: [
              {
                id: 'intentId1',
                name: 'Greeting',
                category: 'smalltalk',
                prompt: 'Hello',
              },
              {
                id: 'intentId2',
                name: 'Joke',
                category: 'smalltalk',
                prompt: 'Tell me a Joke',
              },
              {
                id: 'intentId3',
                name: 'Thanks',
                category: 'smalltalk',
                prompt: 'Thanks',
              },
            ],
          },
        ],
      })
    )
  }),
  rest.get(`https://company-code.workgrid.com/v1/userspaces`, (req, res, ctx) => {
    return res(ctx.json({ data: [{ id: 'space1', name: 'Space 1', default: true }] }))
  }),
  rest.post(`https://company-code.workgrid.com/v1/flags`, (req, res, ctx) => {
    return res(ctx.json({ data: { flag1: { value: true }, flag2: { value: null } } }))
  }),
  rest.get(`https://company-code.workgrid.com/v1/toknow`, (req, res, ctx) => {
    if (req.headers.get('accept') === 'application/vnd.com.workgrid.ast+json;version=3') {
      return res(
        ctx.json({
          notifications: [
            {
              title: `${req.method} ${req.url.pathname}${req.url.search}`,
            },
          ],
        })
      )
    }

    return res(ctx.status(400))
  }),
  rest.get(`https://company-code.workgrid.com/v1/usernotifications/:id`, (req, res, ctx) => {
    if (req.headers.get('accept') === 'application/vnd.com.workgrid.ast+json;version=3') {
      return res(
        ctx.json({
          id: req.params.id,
          title: `${req.method} ${req.url.pathname}`,
        })
      )
    }

    return res(ctx.status(400))
  }),
  rest.get(`https://company-code.workgrid.com/v1/usernotifications/:id/detail`, (req, res, ctx) => {
    if (req.headers.get('accept') === 'application/vnd.com.workgrid.ast+json;version=3') {
      return res(
        ctx.json([
          {
            type: 'TextBlock',
            text: `${req.params.id}`,
          },
        ])
      )
    }

    return res(ctx.status(400))
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
  }),
  rest.post(`https://company-code.workgrid.com/v1/graphql`, (req, res, ctx) => {
    return res(ctx.json({ data: { currentUser: { id: '123124', displayName: 'displayName' } } }))
  }),
  rest.post(`https://company-code.workgrid.com/v2/ask`, (req, res, ctx) => {
    return res(
      ctx.json({
        text: JSON.stringify(req.body),
        actions: ['laugh', 'cringe'],
        suggestions: ['ask another'],
      })
    )
  }),
  rest.post(`https://company-code.workgrid.com/graphql`, (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          me: {
            id: '12345',
            space: {
              id: '17dacf8d-ee8d-45ff-9d6b-f984e789c4e3',
              apps: {
                edges: [
                  {
                    node: {
                      entrypoint: 'f19b6a81-7648-4c72-97df-87f45e24191f',
                      title: 'Intranet Admin Tools',
                    },
                  },
                  {
                    node: {
                      entrypoint: '2b4d2ae8-fde4-4c8a-b4f1-8e349c3fcf68',
                      title: 'Quick Links',
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                },
              },
            },
          },
        },
      })
    )
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
    client = new WorkgridClient({
      context: {
        userAgent: 'user-agent',
        clientAgent: 'client-agent',
        token: 'token',
        companyCode: 'company-code',
      },
    })
  })

  test('httpClient', async () => {
    server.use(
      rest.get(`https://company-code.workgrid.com/v1/echo`, (req, res, ctx) => {
        return res(ctx.json({ headers: req.headers.getAllHeaders() }))
      })
    )

    const result = await client.httpClient.get('/v1/echo')

    expect(result.data.headers['user-agent']).toEqual('user-agent')
    expect(result.data.headers['x-workgrid-client']).toMatch(/^@workgrid\/client\/\d\.\d\.\d client-agent$/)
  })

  test('query', async () => {
    const result = await client.query(['getNotification', { spaceId: 'space-id', id: '1234' }])

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
    const result = await client.mutate('notificationViewed', { spaceId: 'space-id', id: '1234' })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "id": "1234",
        "title": "PUT /v1/usernotifications/1234/view",
      }
    `)
  })

  test('graphql', async () => {
    const gql = String.raw
    const query = gql`
      query appsQuery($spaceId: ID!) {
        me {
          space(spaceId: $spaceId) {
            id
            apps {
              edges {
                node {
                  entrypoint
                  title
                }
              }
              pageInfo {
                hasNextPage
              }
            }
          }
        }
      }
    `

    const variables = {
      spaceId: '17dacf8d-ee8d-45ff-9d6b-f984e789c4e3',
    }
    const result = await client.mutate('graphql', { query, variables })

    expect(result).toMatchInlineSnapshot(`
      Object {
        "me": Object {
          "id": "12345",
          "space": Object {
            "apps": Object {
              "edges": Array [
                Object {
                  "node": Object {
                    "entrypoint": "f19b6a81-7648-4c72-97df-87f45e24191f",
                    "title": "Intranet Admin Tools",
                  },
                },
                Object {
                  "node": Object {
                    "entrypoint": "2b4d2ae8-fde4-4c8a-b4f1-8e349c3fcf68",
                    "title": "Quick Links",
                  },
                },
              ],
              "pageInfo": Object {
                "hasNextPage": false,
              },
            },
            "id": "17dacf8d-ee8d-45ff-9d6b-f984e789c4e3",
          },
        },
      }
    `)
  })

  test('customMutate', async () => {
    const options = { mutationFn: async () => ({ message: 'Hello, world!' }) }
    const result = client.customMutate('mutation-key', undefined, options)

    expect(result).toMatchInlineSnapshot(`Promise {}`)
  })

  describe('queries & mutations', () => {
    test('getSpaces', async () => {
      const result = await client.query(['getSpaces'])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "default": true,
            "id": "space1",
            "name": "Space 1",
          },
        ]
      `)
    })

    test('me', async () => {
      const result = await client.query(['me'])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "displayName": "displayName",
          "id": "123124",
        }
      `)
    })

    test('discover', async () => {
      const result = await client.query(['discover', { spaceId: 'space-id' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "botAliasId": "botAliasId",
            "botId": "botId",
            "from": Object {
              "iconUrl": "Url of the Conversational App icon",
              "name": "Name of Conversational App",
            },
            "intents": Array [
              Object {
                "category": "smalltalk",
                "id": "intentId1",
                "name": "Greeting",
                "prompt": "Hello",
              },
              Object {
                "category": "smalltalk",
                "id": "intentId2",
                "name": "Joke",
                "prompt": "Tell me a Joke",
              },
              Object {
                "category": "smalltalk",
                "id": "intentId3",
                "name": "Thanks",
                "prompt": "Thanks",
              },
            ],
            "locale": "en_US",
            "title": "Conversational App Title",
          },
        ]
      `)
    })

    test('getFlags', async () => {
      const result = await client.query(['getFlags', { spaceId: 'space-id' }])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "flag1": true,
          "flag2": null,
        }
      `)
    })

    test('getNotifications', async () => {
      const result = await client.query(['getNotifications', { spaceId: 'space-id', location: 'toknow' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/toknow?orderBy=date",
          },
        ]
      `)
    })

    test('getNotification', async () => {
      const result = await client.query(['getNotification', { spaceId: 'space-id', id: '1234' }])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "GET /v1/usernotifications/1234",
        }
      `)
    })

    test('getNotificationDetail', async () => {
      const result = await client.query(['getNotificationDetail', { spaceId: 'space-id', id: '1234' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "text": "1234",
            "type": "TextBlock",
          },
        ]
      `)
    })

    test('actionNotification', async () => {
      const result = await client.mutate('actionNotification', { spaceId: 'space-id', id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "POST /v1/usernotifications/1234/action",
        }
      `)
    })

    test('deleteNotification', async () => {
      const result = await client.mutate('deleteNotification', { spaceId: 'space-id', id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "DELETE /v1/usernotifications/1234",
        }
      `)
    })

    test('getActivity', async () => {
      const result = await client.query(['getActivity', { spaceId: 'space-id' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/activity",
          },
        ]
      `)
    })

    test('getApps', async () => {
      const result = await client.query(['getApps', { spaceId: 'space-id' }])

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "title": "GET /v1/microapps",
          },
        ]
      `)
    })

    test('notificationViewed', async () => {
      const result = await client.mutate('notificationViewed', { spaceId: 'space-id', id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "PUT /v1/usernotifications/1234/view",
        }
      `)
    })

    test('notificationDetailViewed', async () => {
      const result = await client.mutate('notificationViewed', { spaceId: 'space-id', id: '1234' })

      expect(result).toMatchInlineSnapshot(`
        Object {
          "id": "1234",
          "title": "PUT /v1/usernotifications/1234/view",
        }
      `)
    })

    test('ask', async () => {
      const result = await client.query([
        'ask',
        {
          spaceId: 'space-id',
          utterance: 'Tell me a joke',
          channel: 'msteams',
          locale: 'en-US',
        },
      ])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "actions": Array [
            "laugh",
            "cringe",
          ],
          "suggestions": Array [
            "ask another",
          ],
          "text": "{\\"utterance\\":\\"Tell me a joke\\",\\"channel\\":\\"msteams\\",\\"locale\\":\\"en-US\\"}",
        }
      `)
    })
    test('ask with ids', async () => {
      const result = await client.query([
        'ask',
        {
          spaceId: 'space-id',
          utterance: 'Tell me a joke',
          channel: 'msteams',
          locale: 'en-US',
          botId: '123456',
          botAliasId: '123456',
        },
      ])

      expect(result).toMatchInlineSnapshot(`
        Object {
          "actions": Array [
            "laugh",
            "cringe",
          ],
          "suggestions": Array [
            "ask another",
          ],
          "text": "{\\"utterance\\":\\"Tell me a joke\\",\\"channel\\":\\"msteams\\",\\"locale\\":\\"en-US\\",\\"botId\\":\\"123456\\",\\"botAliasId\\":\\"123456\\"}",
        }
      `)
    })
  })
})

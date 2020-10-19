jest.mock('@workgrid/client')

import WorkgridClient from '@workgrid/client'
import { WorkgridProvider, useWorkgridClient, useQuery, useMutation, useSubscription } from './client-react'

describe('@workgrid/client-react', () => {
  let client

  beforeEach(() => {
    client = new WorkgridClient()
  })

  describe('useWorkgridClient', () => {
    test.todo('will return the workgrid client')
  })
  describe('useQuery', () => {
    test.todo('will prepare and execute the query')
  })
  describe('useMutation', () => {
    test.todo('will prepare and execute the mutation')
  })
  describe('useSubscription', () => {
    test.todo('will prepare and execute the subscription')
  })
})

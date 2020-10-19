import type { Handler } from './index'
import WorkgridClient from '../client'
import { find, flatMap } from 'lodash'
import { Location } from '../types'

export type QueryHandler<Variables = {}, Data = any> = Handler<Data> & {
  execute(client: WorkgridClient, variables: Variables): Promise<Data>
  initialData?(client: WorkgridClient, variables: Variables): Data | undefined
  getFetchMore?(variables: Variables, data: Data): Variables | undefined

  onQuery?(client: WorkgridClient, variables: Variables): any
  onSuccess?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void
  onError?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void

  staleTime?: number
}

// TODO: Can the type of data be inferred from the response type of `execute`?
// https://stackoverflow.com/questions/49058210/infer-type-from-sibling
// type ThenArg<T> = T extends PromiseLike<infer U> ? U : T
// type x = ThenArg<ReturnType<WorkgridHTTP['getNotifications']>>

export const getNotifications: QueryHandler<{ location: Location; limit?: Number; cursor?: string }> = {
  execute: async (client, { location, limit = 2, cursor }) => {
    return client.http.getNotifications(location, { limit, cursor })
  },
  // If there is a cursor, modify the variables to fetch the next page, otherwise return undefined
  getFetchMore: (variables, data) => (data.cursor ? { ...variables, cursor: data.cursor } : undefined),
  // Store the raw response, and transform  on read
  transformData: data => flatMap(data, 'notifications')
  // How would we manage cache normalization? Are there any relevant redux helpers?
  // normalize: data => ({ notification: keyBy(data.notifications, 'id'), toknow: [map(data.notifications, 'id')] })
}

export const getNotification: QueryHandler<{ id: string }> = {
  execute: async (client, { id }) => {
    return client.http.getNotification(id)
  },
  initialData: (client, { id }) => {
    const toknowState = client.cache.get(['getNotifications', { location: 'toknow' }])
    const todoState = client.cache.get(['getNotifications', { location: 'todo' }])

    // Look for the notification in the toknow or todo lists first
    return find([...(toknowState?.data ?? []), ...(todoState?.data ?? [])], { id })
  }
}

export const getApps: QueryHandler<{ limit?: Number; cursor?: string }> = {
  execute: async (client, { limit, cursor }) => {
    return client.http.getApps({ limit, cursor })
  },
  // If there is a cursor, modify the variables to fetch the next page, otherwise return undefined
  getFetchMore: (variables, data) => (data.cursor ? { ...variables, cursor: data.cursor } : undefined),
  // Store the raw response, and transform  on read
  transformData: data => flatMap(data, 'apps')
}

export const getApp: QueryHandler<{ id: string }> = {
  execute: async (client, { id }) => {
    const data = await client.http.getApps()
    return find(data.apps, { id })
  },
  initialData: (client, { id }) => {
    const { data: apps = [] } = client.cache.get(['getApps', {}]) || {}

    // Look for the app in the apps list first
    return find(apps, { id })
  }
}

export const getActivity: QueryHandler<{ limit?: Number; cursor?: string }> = {
  execute: async (client, { limit = 2, cursor }) => {
    return client.http.getActivity({ limit, cursor })
  },
  // If there is a cursor, modify the variables to fetch the next page, otherwise return undefined
  getFetchMore: (variables, data) => (data.cursor ? { ...variables, cursor: data.cursor } : undefined),
  // Store the raw response, and transform  on read
  transformData: data => flatMap(data, 'notifications')
}

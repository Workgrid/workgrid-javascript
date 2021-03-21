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

/* eslint-disable @typescript-eslint/no-empty-interface */

// The react-query core does not rely on react at runtime :)
import {
  QueryClient,
  QueryFunctionContext,
  QueryObserverOptions,
  MutationObserverOptions,
  QueryKey as CustomQueryKey,
  FetchInfiniteQueryOptions as QueryOptions,
  MutationKey as CustomMutationKey,
  MutationOptions as MutationOptions,
} from 'react-query'
import { flatMap, mapValues } from 'lodash'
import HttpClient from './client-http'
import WsClient from './client-ws'

// Export types for downstream use
export { HttpClient, WsClient }

// Use require to avoid ts6059
const pkg = require('../package.json')

/** @beta */
export type Context = {
  token: string
  spaceId: string
  apiHost: string
  wssHost: string
  userAgent: string
  clientAgent: string
}

/** @beta */
export type PartialContext =
  | (Pick<Context, 'token' | 'spaceId'> & { apiHost: string; wssHost?: string })
  | (Pick<Context, 'token' | 'spaceId'> & { companyCode: string })

/** @beta */
export type ClientOptions = {
  context: PartialContext | (() => Promise<PartialContext>)
  queryClient?: QueryClient
  httpClient?: HttpClient
  wsClient?: WsClient
}

const queries: ((client: Client) => void)[] = []
const mutations: ((client: Client) => void)[] = []

// type LengthOfTuple<T extends unknown[]> = T extends { length: infer L } ? L : never
// type DropFirstInTuple<T extends unknown[]> = T extends [arg: unknown, ...rest: infer U] ? U : T

/**
 * Support a string, or an array with one item, if given a string or single item array (otherwise return K)
 * TODO: Can we determine if everything after the first value is optional, and accept a single string then?
 *
 * @beta
 */
export type Key<K extends string | unknown[]> = K extends string ? K | [K] : K['length'] extends 1 ? K[0] | K : K

/** @beta */
export type Query<
  TQueryKey = string | unknown[],
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = { pages: TQueryFnData[] }
> = {
  TQueryKey: TQueryKey
  TQueryFnData: TQueryFnData
  TQueryData: TQueryData
  TError: TError
  TData: TData
}

/** @beta */
export type QueryKey<K extends keyof Queries, Q extends Query = Queries[K]> = Key<Q['TQueryKey']>

/** @beta */
export type Mutation<
  TMutationKey = string | unknown[],
  TVariables = unknown,
  TData = unknown,
  TContext = unknown,
  TError = unknown
> = {
  TMutationKey: TMutationKey
  TVariables: TVariables
  TContext: TContext
  TError: TError
  TData: TData
}

/** @beta */
export type MutationKey<K extends keyof Mutations, M extends Mutation = Mutations[K]> = Key<M['TMutationKey']>

/** @beta */
class Client {
  readonly queryClient: QueryClient
  readonly httpClient: HttpClient
  readonly wsClient: WsClient

  constructor(options: ClientOptions) {
    const context = () => normalizeContext(options.context)

    this.queryClient = options.queryClient || new QueryClient()
    this.httpClient = options.httpClient || new HttpClient({ context })
    this.wsClient = options.wsClient || new WsClient({ context })

    queries.forEach((query) => query(this))
    mutations.forEach((query) => query(this))
  }

  /**
   * Invoke a query
   *
   * @param queryKey - The query key (must be pre-defined)
   * @param options - Any additional query options
   * @returns - The query result
   *
   * @beta
   */
  query<K extends keyof Queries, Q extends Query = Queries[K]>(
    queryKey: QueryKey<K, Q>,
    options?: QueryOptions<Q['TQueryFnData'], Q['TError'], Q['TData']>
  ) {
    const promise = this.queryClient.fetchInfiniteQuery<Q['TQueryFnData'], Q['TError'], Q['TData']>(queryKey, options)

    // react-query only applies `select` option to hooks usage, manually apply it here
    const { select } = this.queryClient.getQueryDefaults(queryKey) || {}
    return promise.then((result) => (select ? select(result) : result))
  }

  /**
   * Invoke a custom query (should be used sparingly and never in production)
   *
   * @param queryKey - A unique cache key
   * @param options - Any additional query options
   * @returns - The query result
   *
   * @beta
   */
  customQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
    queryKey: CustomQueryKey,
    options?: QueryOptions<TQueryFnData, TError, TData>
  ) {
    const promise = this.queryClient.fetchInfiniteQuery<TQueryFnData, TError, TData>(queryKey, options)

    // react-query only applies `select` option to hooks usage, manually apply it here
    const { select } = _defaultSelect(options) // Apply the default select method
    return promise.then((result) => (select ? select(result) : result))
  }

  /**
   * Invoke a mutation
   *
   * @param mutationKey - The mutation key (must be pre-defined)
   * @param variables - The appropriate variables
   * @param options - Any additional mutation options
   * @returns - The mutation result
   *
   * @beta
   */
  mutate<K extends keyof Mutations, M extends Mutation = Mutations[K]>(
    mutationKey: MutationKey<K, M>,
    variables?: M['TVariables'],
    options?: MutationOptions<M['TData'], M['TError'], M['TVariables'], M['TContext']>
  ) {
    return this.queryClient.executeMutation<M['TData'], M['TError'], M['TVariables'], M['TContext']>({
      mutationKey,
      variables,
      ...options,
    })
  }

  /**
   * Invoke a custom mutation (should be used sparingly and never in production)
   *
   * @param mutationKey - A unique cache key
   * @param variables - The appropriate variables
   * @param options - Any additional mutation options
   * @returns - The mutation result
   *
   * @beta
   */
  customMutate<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
    mutationKey: CustomMutationKey,
    variables?: TVariables,
    options?: MutationOptions<TData, TError, TVariables, TContext>
  ) {
    return this.queryClient.executeMutation<TData, TError, TVariables, TContext>({
      mutationKey,
      variables,
      ...options,
    })
  }
}

export default Client

/**
 * Normalize context to always return a consistent set of fields (apiHost and wssHost)
 *
 * @param context - The provided context options
 * @returns - A normalized context object
 */
async function normalizeContext(context: ClientOptions['context']): Promise<Context> {
  const { token, spaceId, ...partial } = typeof context === 'function' ? await context() : context

  const apiHost = 'apiHost' in partial ? partial.apiHost : `https://${partial.companyCode}.workgrid.com`
  const wssHost = 'wssHost' in partial && partial.wssHost ? partial.wssHost : apiHost.replace('https://', 'wss://')

  const userAgent = navigator.userAgent
  const clientAgent = `${pkg.name}/${pkg.version}`

  return { token, spaceId, apiHost, wssHost, userAgent, clientAgent }
}

/**
 * Attach a default select callback to normalize data
 * (We always use infinite query and the flatten the page data)
 *
 * @param options - The query defaults options
 * @returns - The query defaults options (with default select)
 *
 * @internal
 */
export function _defaultSelect<Q extends Query, O>(options: O) {
  return {
    select(data: Q['TQueryData']) {
      if (Array.isArray(data.pages[0])) {
        return flatMap(data.pages)
      }

      // If pages is not an array of arrays
      // just return the first page item
      return data.pages[0]
    },
    ...options,
  }
}

/** This interface is populated inline as query defaults are applied
 *
 * @beta
 */
export interface Queries {}

interface SetQueryDefaultsOptions<Q extends Query>
  extends QueryObserverOptions<Q['TQueryFnData'], Q['TError'], Q['TData'], Q['TQueryData']> {
  queryFn?(context: QueryFunctionContext<Q['TQueryKey']>): Q['TQueryFnData'] | Promise<Q['TQueryFnData']>
}

/**
 * Define a built-in query
 *
 * @param queryKey - The string cache key
 * @param callback - A function that returns default options
 */
function setTypedQueryDefaults<K extends keyof Queries>(
  queryKey: K,
  callback: (client: Client) => SetQueryDefaultsOptions<Queries[K]>
) {
  queries.push((client) => {
    const options = _defaultSelect(callback(client))
    client.queryClient.setQueryDefaults(queryKey, options)
  })
}

/** This interface is populated inline as mutation defaults are applied
 *
 * @beta
 */
export interface Mutations {}
interface SetMutationDefaultsOptions<M extends Mutation>
  extends MutationObserverOptions<M['TData'], M['TError'], M['TVariables'], M['TContext']> {}

/**
 * Define a built-in mutation
 *
 * @param mutationKey - The string cache key
 * @param callback - A function that returns default options
 */
function setTypedMutationDefaults<Key extends keyof Mutations>(
  mutationKey: Key,
  callback: (client: Client) => SetMutationDefaultsOptions<Mutations[Key]>
) {
  mutations.push((client) => {
    const options = callback(client)
    client.queryClient.setMutationDefaults(mutationKey, options)
  })
}

/** @beta */
export type Location = 'toknow' | 'todo'
/** @beta */
export type Notification = { [key: string]: unknown }
/** @beta */
export type App = { [key: string]: unknown }

// getFlags
// ================================================================================================================================

/** @beta */
export type Flags = { [key: string]: boolean | string | number | null }

/** @beta */
export interface Queries {
  getFlags: Query<['getFlags'], Flags>
}

setTypedQueryDefaults('getFlags', (client) => ({
  queryFn: async () => {
    const response = await client.httpClient.post(`/v1/flags`)
    return mapValues(response.data, 'value')
  },
}))

// getNotifications
// ================================================================================================================================

/** @beta */
export type NotificationsPage = { notifications: Notification[]; cursor?: string }

/** @beta */
export interface Queries {
  getNotifications: Query<
    ['getNotifications', { location: Location; limit?: number }],
    NotificationsPage,
    unknown,
    NotificationsPage['notifications']
  >
}

setTypedQueryDefaults('getNotifications', (client) => ({
  queryFn: async (context) => {
    const { location, limit } = context.queryKey[1]
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/${location}`, { params: { limit, cursor } })
    return response.data
  },
  getNextPageParam: (lastPage) => {
    return lastPage.cursor
  },
  select: (data) => {
    return flatMap(data.pages, (page) => page.notifications)
  },
}))

// getNotification
// ================================================================================================================================

/** @beta */
export interface Queries {
  getNotification: Query<['getNotification', string], Notification>
}

setTypedQueryDefaults('getNotification', (client) => ({
  queryFn: async (context) => {
    const id = context.queryKey[1]

    const response = await client.httpClient.get(`/v1/usernotifications/${id}`)
    return response.data
  },
}))

// actionNotification
// ================================================================================================================================

/** @beta */
export interface Mutations {
  actionNotification: Mutation<['actionNotification'], { id: string; data: unknown }, Notification>
}

setTypedMutationDefaults('actionNotification', (client) => ({
  mutationFn: async (variables) => {
    const { id, data } = variables

    const response = await client.httpClient.post(`/v1/usernotifications/${id}/action`, data)
    return response.data
  },
}))

// deleteNotification
// ================================================================================================================================

/** @beta */
export interface Mutations {
  deleteNotification: Mutation<['deleteNotification'], { id: string }, Notification>
}

setTypedMutationDefaults('deleteNotification', (client) => ({
  mutationFn: async (variables) => {
    const { id } = variables

    const response = await client.httpClient.delete(`/v1/usernotifications/${id}`)
    return response.data
  },
}))

// getActivity
// ================================================================================================================================

/** @beta */
export type ActivityPage = { activity: unknown[]; cursor?: string }

/** @beta */
export interface Queries {
  getActivity: Query<['getActivity', { limit?: number }?], ActivityPage, unknown, ActivityPage['activity']>
}

setTypedQueryDefaults('getActivity', (client) => ({
  queryFn: async (context) => {
    const { limit } = context.queryKey[1] || {}
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/activity`, { params: { limit, cursor } })
    return response.data
  },
  getNextPageParam: (lastPage) => {
    return lastPage.cursor
  },
  select: (data) => {
    return flatMap(data.pages, (page) => page.activity)
  },
}))

// getApps
// ================================================================================================================================

/** @beta */
export type AppsPage = { apps: App[]; cursor?: string }

/** @beta */
export interface Queries {
  getApps: Query<['getApps', { limit?: number }?], AppsPage, unknown, AppsPage['apps']>
}

setTypedQueryDefaults('getApps', (client) => ({
  queryFn: async (context) => {
    const { limit } = context.queryKey[1] || {}
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/microapps`, { params: { limit, cursor } })
    return response.data
  },
  getNextPageParam: (lastPage) => {
    return lastPage.cursor
  },
  select: (data) => {
    return flatMap(data.pages, (page) => page.apps)
  },
}))

// Analytics

// notificationViewed
// ================================================================================================================================

/** @beta */
export interface Mutations {
  notificationViewed: Mutation<['notificationViewed'], { id: string }, Notification>
}

setTypedMutationDefaults('notificationViewed', (client) => ({
  mutationFn: async (variables) => {
    const { id } = variables

    const response = await client.httpClient.put(`/v1/usernotifications/${id}/view`)
    return response.data
  },
}))

// notificationDetailViewed
// ================================================================================================================================

/** @beta */
export interface Mutations {
  notificationDetailViewed: Mutation<['notificationDetailViewed'], { id: string }, Notification>
}

setTypedMutationDefaults('notificationDetailViewed', (client) => ({
  mutationFn: async (variables) => {
    const { id } = variables

    const response = await client.httpClient.put(`/v1/usernotifications/${id}/view-detail`)
    return response.data
  },
}))

// type Queries = {
//   notifications: Query<
//     ['notifications', { location: Location; limit?: number }],
//     { notifications: Notification[]; cursor?: string },
//     unknown,
//     Notification[],
//     { pages: Array<{ notifications: Notification[]; cursor?: string }> }
//   >
//   notification: Query<['notification', string], Notification>
// }

// type SetQueryDefaultsOptions<TQuery extends Query> = Omit<
//   QueryObserverOptions<TQuery['TQueryFnData'], unknown, TQuery['TData'], TQuery['TQueryData']>,
//   'queryFn'
// > & {
//   queryFn(context: QueryFunctionContext<TQuery['TQueryKey']>): TQuery['TQueryFnData'] | Promise<TQuery['TQueryFnData']>
// }

// type Queries = Record<string, TQuery> & {
//   notifications: {
//     key: string
//   }
// }

// type Queries = {
//   // notifications(options: {
//   //   location: Location
//   //   limit?: number
//   // }): [{ notifications: Notification[]; cursor?: string }, Notification[]]

//   notifications: {
//     TQueryKey: ['notifications', { location: Location; limit?: number }]
//     TQueryFnData: { notifications: Notification[]; cursor?: string }
//     TQueryData: { pages: Array<{ notifications: Notification[]; cursor?: string }> }
//     TData: Notification[]
//   }
// }

// function populateDefaultQueries(client: Client) {
//   function setTypedQueryDefaults<Key extends keyof Queries>(
//     queryKey: Key,
//     options: SetQueryDefaultsOptions<Queries[Key]>
//   ) {
//     return client.queryClient.setQueryDefaults(queryKey, options)
//   }

//   // Notifications
//   // ================================================================================================================================

//   // interface Queries {
//   //   notifications: Query<
//   //     ['notifications', { location: Location; limit?: number }],
//   //     { notifications: Notification[]; cursor?: string },
//   //     unknown,
//   //     Notification[],
//   //     { pages: Array<{ notifications: Notification[]; cursor?: string }> }
//   //   >
//   // }

//   setTypedQueryDefaults('notifications', {
//     queryFn: async (context) => {
//       const { location, limit } = context.queryKey[1]
//       const cursor = context.pageParam

//       const response = await client.httpClient.get(`/v1/${location}`, { params: { limit, cursor } })
//       return response.data
//     },
//     select: (data) => {
//       return flatMap(data.pages, 'notifications')
//     },
//   })

//   // Notification
//   // ================================================================================================================================

//   // interface Queries {
//   //   notification: Query<['notification', string], Notification>
//   // }

//   setTypedQueryDefaults('notification', {
//     queryFn: async (context) => {
//       const id = context.queryKey[1]

//       const response = await client.httpClient.get(`/v1/usernotifications/${id}`)
//       return response.data as Notification
//     },
//   })

//   // const SmartNotificationHeaders = { 'content-type': 'v3' }

//   // type NotificationsPage = { notifications: Notification[]; cursor?: string }

//   // client.queryClient.setQueryDefaults('notifications', {
//   //   queryFn: async (
//   //     context: QueryFunctionContext<['notifications', { location: Location; limit?: number }], string>
//   //   ) => {
//   //     const { location, limit } = context.queryKey[1]
//   //     const cursor = context.pageParam

//   //     const response = await client.httpClient.get(`/v1/${location}`, {
//   //       params: { limit, cursor },
//   //       headers: SmartNotificationHeaders,
//   //     })
//   //     return response.data as NotificationsPage
//   //   },
//   //   getNextPageParam: (lastPage: NotificationsPage) => lastPage.cursor,
//   //   select: (data) => data.pages.flatMap((page: NotificationsPage) => page.notifications), // The public API :)
//   // })

//   // client.queryClient.setQueryDefaults('notification', {
//   //   queryFn: async (context: QueryFunctionContext<['notification', string], string>) => {
//   //     const id = context.queryKey[1]

//   //     const response = await client.httpClient.get(`/v1/usernotifications/${id}`)
//   //     return response.data as Notification
//   //   },
//   //   // TODO:
//   //   // initialData: () => client.queryClient.getQueryCache().find('notifications')
//   // })

//   // // TODO: What if we want to subscribe
//   // client.wsClient.subscribe('notification', (data) => {
//   //   const notification = data as Notification
//   //   // client.httpClient.getNotification() // do we need this? :D
//   //   client.queryClient.invalidateQuery(['notification', notification.id])
//   //   return client.queryClient.fetchQuery(['notification', notification.id], { /* skip caching? */ })
//   //   // client.queryClient.setQueryData(['notification', notification.id], notification)
//   // })
// }

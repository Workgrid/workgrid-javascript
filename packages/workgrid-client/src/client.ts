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
} from 'react-query/core'
import { flatMap, mapValues } from 'lodash'
import HttpClient from './client-http'
import WsClient from './client-ws'

// Export types for downstream use
export { HttpClient, WsClient }

// Use require to avoid ts6059
const pkg = require('../package.json')

const gql = String.raw // better editor integrations

/** @beta */
export type Context = {
  token: string
  apiHost: string
  wssHost: string
  userAgent: string // Use navigator.userAgent in browser, use a relevant string in node
  clientAgent: string // Can optionally append a string to the built-in client agent
}

/** @beta */
export type PartialContext =
  | (Pick<Context, 'token' | 'userAgent'> & { clientAgent?: string } & { apiHost: string; wssHost?: string })
  | (Pick<Context, 'token' | 'userAgent'> & { clientAgent?: string } & { companyCode: string })

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
// export type Key<K extends string | unknown[]> = K extends string ? K | [K] : K['length'] extends 1 ? K[0] | K : K

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
// export type QueryKey<K extends keyof Queries, Q extends Query = Queries[K]> = Key<Q['TQueryKey']>
export type QueryKey<K extends keyof Queries, Q extends Query = Queries[K]> = Q['TQueryKey'] extends string | [string]
  ? K | [K]
  : Q['TQueryKey'] extends [string, ...infer R]
  ? [K, ...R]
  : never

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
// export type MutationKey<K extends keyof Mutations, M extends Mutation = Mutations[K]> = Key<M['TMutationKey']>
export type MutationKey<K extends keyof Mutations, Q extends Mutation = Mutations[K]> = Q['TMutationKey'] extends
  | string
  | [string]
  ? K | [K]
  : Q['TMutationKey'] extends [string, ...infer R]
  ? [K, ...R]
  : never

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
   * @returns The query result
   *
   * @beta
   */
  query<K extends keyof Queries, Q extends Query = Queries[K]>(
    queryKey: QueryKey<K, Q>,
    options?: QueryOptions<Q['TQueryFnData'], Q['TError'], Q['TData']>
  ): Promise<Q['TData']> {
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
   * @returns The query result
   *
   * @beta
   */
  customQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
    queryKey: CustomQueryKey,
    options?: QueryOptions<TQueryFnData, TError, TData>
  ): Promise<TData> {
    const promise = this.queryClient.fetchInfiniteQuery<TQueryFnData, TError, TData>(queryKey, options)

    // react-query only applies `select` option to hooks usage, manually apply it here
    const { select } = _defaultSelect(options) // Apply the default select method
    return promise.then((result) => (select ? select(result) : result) as TData)
  }

  /**
   * Invoke a mutation
   *
   * @param mutationKey - The mutation key (must be pre-defined)
   * @param variables - The appropriate variables
   * @param options - Any additional mutation options
   * @returns The mutation result
   *
   * @beta
   */
  mutate<K extends keyof Mutations, M extends Mutation = Mutations[K]>(
    mutationKey: MutationKey<K, M>,
    variables?: M['TVariables'],
    options?: MutationOptions<M['TData'], M['TError'], M['TVariables'], M['TContext']>
  ): Promise<M['TData']> {
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
   * @returns The mutation result
   *
   * @beta
   */
  customMutate<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
    mutationKey: CustomMutationKey,
    variables?: TVariables,
    options?: MutationOptions<TData, TError, TVariables, TContext>
  ): Promise<TData> {
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
 * @returns A normalized context object
 */
async function normalizeContext(context: ClientOptions['context']): Promise<Context> {
  const { token, userAgent, ...partial } = typeof context === 'function' ? await context() : context

  const apiHost = 'apiHost' in partial ? partial.apiHost : `https://${partial.companyCode}.workgrid.com`
  const wssHost = 'wssHost' in partial && partial.wssHost ? partial.wssHost : apiHost.replace('https://', 'wss://')

  const clientAgent = [`${pkg.name}/${pkg.version}`, partial.clientAgent].filter(Boolean).join(' ')

  return { token, apiHost, wssHost, userAgent, clientAgent }
}

/**
 * Attach a default select callback to normalize data
 * (We always use infinite query and the flatten the page data)
 *
 * @param options - The query defaults options
 * @returns The query defaults options (with default select)
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

// getSpaces
// ================================================================================================================================

/** @beta */
export type Spaces = { id: string; name: string; default: boolean }[]

/** @beta */
export interface Queries {
  getSpaces: Query<['getSpaces'], Spaces>
}

setTypedQueryDefaults('getSpaces', (client) => ({
  queryFn: async () => {
    const response = await client.httpClient.get(`/v1/userspaces`)
    return response.data.data /* unwrap jsend */
  },
}))

// me
// ================================================================================================================================

/** @beta */
export type Me = { id: string; displayName: string; userName: string }

/** @beta */
export interface Queries {
  me: Query<['me'], Me>
}

setTypedQueryDefaults('me', (client) => ({
  queryFn: async () => {
    const response = await client.httpClient.post('/v1/graphql', {
      query: gql`
        query currentUser($authContext: AuthContext!) {
          currentUser(authContext: $authContext) {
            id
            displayName
            userName
            name {
              givenName
              familyName
            }
          }
        }
      `,
    })
    return response.data.data.currentUser /* unwrap jsend */
  },
}))

// discover
// ================================================================================================================================

/** @beta */
export type DiscoverPage = { items: Record<string, unknown>[] }

/** @beta */
export interface Queries {
  discover: Query<['discover', { spaceId: string }], DiscoverPage, unknown, DiscoverPage['items']>
}

setTypedQueryDefaults('discover', (client) => ({
  queryFn: async (context) => {
    const { spaceId } = context.queryKey[1]
    const response = await client.httpClient.get(`/v1/discover`, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return response.data
  },
  select: (data) => {
    return flatMap(data.pages, (page) => page.items)
  },
}))

// getFlags
// ================================================================================================================================

/** @beta */
export type Flags = { [key: string]: boolean | string | number | null }

/** @beta */
export interface Queries {
  getFlags: Query<['getFlags', { spaceId: string }], Flags>
}

setTypedQueryDefaults('getFlags', (client) => ({
  queryFn: async (context) => {
    const { spaceId } = context.queryKey[1]
    const response = await client.httpClient.post(`/v1/flags`, null, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return mapValues(response.data.data, 'value') /* unwrap jsend */
  },
}))

// getNotifications
// ================================================================================================================================

/** @beta */
export type NotificationsPage = { notifications: Notification[]; cursor?: string }

/** @beta */
export interface Queries {
  getNotifications: Query<
    ['getNotifications', { spaceId: string; location: Location; limit?: number }],
    NotificationsPage,
    unknown,
    NotificationsPage['notifications']
  >
}

setTypedQueryDefaults('getNotifications', (client) => ({
  queryFn: async (context) => {
    const { spaceId, location, limit } = context.queryKey[1]
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/${location}`, {
      // TODO - Add a version number variable to this in the future to keep in sync
      headers: { 'x-workgrid-space': spaceId, Accept: 'application/vnd.com.workgrid.ast+json;version=3' },
      params: { limit, cursor, orderBy: 'date' },
    })
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
  getNotification: Query<['getNotification', { spaceId: string; id: string }], Notification>
}

setTypedQueryDefaults('getNotification', (client) => ({
  queryFn: async (context) => {
    const { spaceId, id } = context.queryKey[1]

    const response = await client.httpClient.get(`/v1/usernotifications/${id}`, {
      headers: { 'x-workgrid-space': spaceId, Accept: 'application/vnd.com.workgrid.ast+json;version=3' },
    })
    return response.data
  },
}))

// getNotificationDetail
// ================================================================================================================================

/** @beta */
export interface Queries {
  getNotificationDetail: Query<['getNotificationDetail', { spaceId: string; id: string }], Notification>
}

setTypedQueryDefaults('getNotificationDetail', (client) => ({
  queryFn: async (context) => {
    const { spaceId, id } = context.queryKey[1]

    const response = await client.httpClient.get(`/v1/usernotifications/${id}/detail`, {
      headers: { 'x-workgrid-space': spaceId, Accept: 'application/vnd.com.workgrid.ast+json;version=3' },
    })
    return response.data
  },
}))

// actionNotification
// ================================================================================================================================

/** @beta */
export interface Mutations {
  actionNotification: Mutation<['actionNotification'], { spaceId: string; id: string; data?: unknown }, Notification>
}

setTypedMutationDefaults('actionNotification', (client) => ({
  mutationFn: async (variables) => {
    const { spaceId, id, data } = variables

    const response = await client.httpClient.post(`/v1/usernotifications/${id}/action`, data, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return response.data.data /* unwrap jsend */
  },
}))

// deleteNotification
// ================================================================================================================================

/** @beta */
export interface Mutations {
  deleteNotification: Mutation<['deleteNotification'], { spaceId: string; id: string }, Notification>
}

setTypedMutationDefaults('deleteNotification', (client) => ({
  mutationFn: async (variables) => {
    const { spaceId, id } = variables

    const response = await client.httpClient.delete(`/v1/usernotifications/${id}`, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return response.data.data /* unwrap jsend */
  },
}))

// graphql

// ================================================================================================================================

/** @beta */
export interface Mutations {
  graphql: Mutation<['graphql'], { query: string; variables: unknown }, unknown>
}

setTypedMutationDefaults('graphql', (client) => ({
  mutationFn: async (params) => {
    const { query, variables } = params

    const data = {
      query,
      variables,
    }

    const response = await client.httpClient.post('graphql', data)
    return response.data.data /* unwrap graphql */
  },
}))

// getActivity
// ================================================================================================================================

/** @beta */
export type ActivityPage = { activity: unknown[]; cursor?: string }

/** @beta */
export interface Queries {
  getActivity: Query<
    ['getActivity', { spaceId: string; limit?: number }],
    ActivityPage,
    unknown,
    ActivityPage['activity']
  >
}

setTypedQueryDefaults('getActivity', (client) => ({
  queryFn: async (context) => {
    const { spaceId, limit } = context.queryKey[1]
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/activity`, {
      headers: { 'x-workgrid-space': spaceId },
      params: { limit, cursor },
    })
    return response.data.data /* unwrap jsend */
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
  getApps: Query<['getApps', { spaceId: string; limit?: number }], AppsPage, unknown, AppsPage['apps']>
}

setTypedQueryDefaults('getApps', (client) => ({
  queryFn: async (context) => {
    const { spaceId, limit } = context.queryKey[1]
    const cursor = context.pageParam

    const response = await client.httpClient.get(`/v1/microapps`, {
      headers: { 'x-workgrid-space': spaceId },
      params: { limit, cursor },
    })
    return response.data.data /* unwrap jsend */
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
  notificationViewed: Mutation<['notificationViewed'], { spaceId: string; id: string }, Notification>
}

setTypedMutationDefaults('notificationViewed', (client) => ({
  mutationFn: async (variables) => {
    const { spaceId, id } = variables

    const response = await client.httpClient.put(`/v1/usernotifications/${id}/view`, undefined, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return response.data.data /* unwrap jsend */
  },
}))

// notificationDetailViewed
// ================================================================================================================================

/** @beta */
export interface Mutations {
  notificationDetailViewed: Mutation<['notificationDetailViewed'], { spaceId: string; id: string }, Notification>
}

setTypedMutationDefaults('notificationDetailViewed', (client) => ({
  mutationFn: async (variables) => {
    const { spaceId, id } = variables

    const response = await client.httpClient.put(`/v1/usernotifications/${id}/view-detail`, undefined, {
      headers: { 'x-workgrid-space': spaceId },
    })
    return response.data.data /* unwrap jsend */
  },
}))

// askApi
// ================================================================================================================================

/** @beta */
export type PromptResponse = {
  botId: string
  botAliasId: string
  appId?: string
  type: string
}
/** @beta */
export type AskResponse = {
  actions?: string[]
  suggestions?: string[]
  prompt?: PromptResponse
  text: string
}

/** @beta */
export interface Queries {
  ask: Query<
    [
      'ask',
      {
        spaceId: string
        utterance: string
        channel: string
        locale: string
        appId?: string
        botId?: string
        botAliasId?: string
      }
    ],
    AskResponse
  >
}

setTypedQueryDefaults('ask', (client) => ({
  queryFn: async (context) => {
    const { spaceId, utterance, channel, locale, botId, botAliasId, appId } = context.queryKey[1]

    const response = await client.httpClient.post(
      '/v2/ask',
      { utterance, channel, locale, ...(botId ? { botId, botAliasId } : null), ...(appId ? { appId } : null) },
      {
        headers: { 'x-workgrid-space': spaceId },
      }
    )
    return response.data
  },
}))

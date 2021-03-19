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

import WorkgridCache from './workgrid-cache'
import WorkgridHTTP from './workgrid-http'
import WorkgridWS from './workgrid-ws'

import { merge } from 'lodash'

import { QueryState, MutationState, SubscriptionState } from './state'
import { QueryConfig, MutationConfig, SubscriptionConfig } from './state'
import { queries, mutations, subscriptions } from './handlers'

export type QueryParameters = Parameters<WorkgridClient['query']>
export type MutateParameters = Parameters<WorkgridClient['mutate']>
export type SubscribeParameters = Parameters<WorkgridClient['subscribe']>

export type WorkgridDefaults = {}
export type WorkgridContext =
  | { token: string; spaceId: string; companyCode: string }
  | (() => Promise<{ token: string; spaceId: string; companyCode: string }>)

class WorkgridClient {
  readonly defaults?: WorkgridDefaults
  readonly context: WorkgridContext
  readonly cache: WorkgridCache
  readonly http: WorkgridHTTP
  readonly ws: WorkgridWS

  constructor({ defaults, context }: { defaults?: WorkgridDefaults; context: WorkgridContext }) {
    this.defaults = defaults
    this.context = context
    this.cache = new WorkgridCache()
    this.http = new WorkgridHTTP({ context })
    this.ws = new WorkgridWS({ context })

    // window.addEventListener('online', () => this.online())
    // window.addEventListener('offline', () => this.offline())
  }

  // TODO: query, mutate & subscribe have a lot in common,
  // but creating a strongly typed abstraction has proved difficult...

  async query(key: keyof typeof queries, config?: QueryConfig) {
    const configWithDefaults = merge({ variables: {} }, this.defaults, config)

    const state = this.cache.create([key, configWithDefaults.variables], () => {
      if (!(key in queries)) {
        throw new Error(`Unknown query: ${key}`)
      }

      const handler = queries[key]
      return new QueryState(handler, this, configWithDefaults)
    })

    await state.execute()

    if (state.status === 'error') {
      throw state.error
    }

    return state.data
  }

  async mutate(key: keyof typeof mutations, config?: MutationConfig) {
    const configWithDefaults = merge({ variables: {} }, this.defaults, config)

    const state = this.cache.create([key, configWithDefaults.variables], () => {
      if (!(key in mutations)) {
        throw new Error(`Unknown mutation: ${key}`)
      }

      const handler = mutations[key]
      return new MutationState(handler, this, configWithDefaults)
    })

    await state.execute()

    if (state.status === 'error') {
      throw state.error
    }

    return state.data
  }

  async subscribe(key: keyof typeof subscriptions, config?: SubscriptionConfig) {
    const configWithDefaults = merge({ variables: {} }, this.defaults, config)

    const state = this.cache.create([key, configWithDefaults.variables], () => {
      if (!(key in subscriptions)) {
        throw new Error(`Unknown subscription: ${key}`)
      }

      const handler = subscriptions[key]
      return new SubscriptionState(handler, this, configWithDefaults)
    })

    await state.execute()

    if (state.status === 'error') {
      throw state.error
    }

    return state.data
  }
}

export default WorkgridClient

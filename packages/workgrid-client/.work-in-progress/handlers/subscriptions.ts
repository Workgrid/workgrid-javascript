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

import type { Handler } from './index'
import WorkgridClient from '../client'
import { Location } from '../types'

export type SubscriptionHandler<Variables = {}, Data = any> = Handler<Data> & {
  execute(client: WorkgridClient, variables: Variables, callback: (data: Data) => void): Promise<Data>

  onSubscriptionData?(client: WorkgridClient, variables: Variables, data: Data): void
}

export const badgeUpdate: SubscriptionHandler<{}> = {
  execute: async (client, variables, callback) => {
    return new Promise((resolve) => {
      client.ws.subscribe('BADGE_UPDATE', (data: any) => {
        callback(data)
        resolve() // what happens if we "resolve" multiple times?
      })
    })
  },
}

export const newNotification: SubscriptionHandler<{ location: Location }> = {
  execute: async (client, { location }, callback) => {
    return new Promise((resolve) => {
      client.ws.subscribe('NEW_NOTIFICATION', (data: any) => {
        if (data.location !== location) return

        callback(data)
        resolve() // what happens if we "resolve" multiple times?
      })
    })
  },
  onSubscriptionData: (client, { location }, data: any) => {
    // Invalidate the list so it gets reloaded with the new notification
    // this.cache.invalidateQueries(['getNotifications', { location }])
    console.log(client, location, data)
    // can we set `state.stale = new Date()` and then each time we read the data,
    // check if there is a stale date and if we're past it, triggering a refetch
  },
}

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
import { find, remove } from 'lodash'

export type MutationHandler<Variables = {}, Data = any> = Handler<Data> & {
  execute(client: WorkgridClient, variables: Variables): Promise<Data>

  onMutate?(client: WorkgridClient, variables: Variables): any
  onSuccess?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void
  onError?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void
}

export const actionNotification: MutationHandler<{ id: string; data: any }> = {
  execute: async (client, { id, data }) => {
    return client.http.actionNotification(id, data)
  },
  onMutate: (client, { id }) => {
    const actionStatus = { status: 'pending', actionTakenDate: new Date().toJSON() }

    const state = client.cache.get(['getNotification', { id }])
    if (state && state.state.data && state.state.data.actionStatus.status !== 'pending') {
      state.state.data.actionStatus = actionStatus
      state.dispatch()
    }

    // Because we do not have a normalized cache, we need to loop over the
    // locations and manually update each list :( using mutation cause whatever

    for (const location of ['toknow', 'todo']) {
      const state = client.cache.get(['getNotifications', { location }])
      if (!state || !state.state.data) continue

      const notification = find(state.data, { id })
      if (!notification || notification.actionStatus !== 'pending') continue

      notification.actionStatus = actionStatus
      state.dispatch()
    }

    // TODO: Actioned notifications move to the /activity list

    // TODO: Return the necessary information to revert these changes in the onError handler
  },
}

export const deleteNotification: MutationHandler<{ id: string }> = {
  execute: async (client, { id }) => {
    return client.http.deleteNotification(id)
  },
  onMutate: (client, { id }) => {
    client.cache.delete(['getNotification', { id }])

    // Because we do not have a normalized cache, we need to loop over the
    // locations and manually update each list :( using mutation cause whatever

    for (const location of ['toknow', 'todo']) {
      const state = client.cache.get(['getNotifications', { location }])

      if (!state || !state.state.data) continue
      if (!find(state.data, { id })) continue

      // @ts-ignore -- typescript can't understand data will not be undefined...
      state.state.data.forEach((data: any) => remove(data.notifications, { id }))
      state.dispatch()
    }

    // TODO: Return the necessary information to revert these changes in the onError handler
  },
}

export const notificationViewed: MutationHandler<{ id: string }> = {
  execute: async (client, { id }) => {
    return client.http.notificationViewed(id)
  },
  onMutate: (client, { id }) => {
    const state = client.cache.get(['getNotification', { id }])
    if (state && state.state.data && state.state.data.viewed !== true) {
      state.state.data.viewed = true
      state.dispatch()
    }

    // Because we do not have a normalized cache, we need to loop over the
    // locations and manually update each list :( using mutation cause whatever

    for (const location of ['toknow', 'todo']) {
      const state = client.cache.get(['getNotifications', { location }])
      if (!state || !state.state.data) continue

      const notification = find(state.data, { id })
      if (!notification || notification.viewed === true) continue

      notification.viewed = true
      state.dispatch()
    }

    // TODO: Return the necessary information to revert these changes in the onError handler
  },
}

export const notificationDetailViewed: MutationHandler<{ id: string }> = {
  execute: async (client, { id }) => {
    return client.http.notificationDetailViewed(id)
  },
}

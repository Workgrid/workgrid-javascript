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

import { EventEmitter } from 'events'
import { Context } from './client'

/**
 * @beta
 */
class WorkgridWS {
  private context: () => Promise<Context>
  private emitter: EventEmitter
  private connection?: Promise<WebSocket>
  private pingInterval: number

  constructor({ context, pingInterval }: { context: () => Promise<Context>; pingInterval?: number }) {
    this.context = context
    this.emitter = new EventEmitter()
    this.pingInterval = pingInterval || 60 * 1000
  }

  /**
   * Create a new websocket connection (singleton)
   */
  private connect() {
    if (this.connection) return this.connection

    return (this.connection = (async () => {
      const { token, spaceId, wssHost, userAgent, clientAgent } = await this.context()

      let interval: ReturnType<typeof setTimeout>
      const connection = new WebSocket(`${wssHost}/rtm-ws`)

      connection.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data)
        if (this.emitter) this.emitter.emit(type, data)
      }

      // TODO: Wait to resolve until the connection is open?
      connection.onopen = async () => {
        this.publish('authenticate', { token, spaceId, userAgent, clientAgent })
        interval = setInterval(() => this.publish('ping'), this.pingInterval)
      }

      // TODO: Reopen connection?
      connection.onerror = () => {
        interval && clearInterval(interval)
        this.connection = undefined
      }

      // TODO: Reopen connection?
      connection.onclose = () => {
        interval && clearInterval(interval)
        this.connection = undefined
      }

      return connection
    })())
  }

  /**
   * Listen to events for the given trigger
   *
   * @param trigger - The event name
   * @param callback - The event listener
   * @returns - An unsubscribe method
   *
   * @beta
   */
  subscribe(trigger: string, callback: (...args: unknown[]) => void) {
    this.connect()

    this.emitter.on(trigger, callback)
    return () => this.emitter.off(trigger, callback)
  }

  /**
   * Publish an event
   *
   * @param type - The event type
   * @param data - The event payload
   *
   * @beta
   */
  publish(type: string, data?: unknown) {
    const message = JSON.stringify({ type, data })
    this.connect().then((connection) => connection.send(message))
  }
}

export default WorkgridWS

/*
 * Similar to workgrid-http, this of this as a generic websocket adapter
 * that enables multiple subscribes (like an event emitter!)
 */

import { EventEmitter } from 'events'
import { WorkgridContext } from './client'

class WorkgridWS {
  private context: WorkgridContext
  private emitter: EventEmitter
  private connection?: Promise<WebSocket>

  constructor({ context }: { context: WorkgridContext }) {
    this.context = context
    this.emitter = new EventEmitter()
  }

  /**
   * Create a new websocket connection (singleton)
   */
  private connect() {
    if (this.connection) return this.connection

    return (this.connection = (async () => {
      const { token, spaceId, companyCode } = typeof this.context === 'function' ? await this.context() : this.context

      let interval: NodeJS.Timeout
      const connection = new WebSocket(`wss://${companyCode}.workgrid.com/rtm-ws`)

      connection.onmessage = event => {
        const { type, data } = JSON.parse(event.data)
        if (this.emitter) this.emitter.emit(type, data)
      }

      connection.onopen = async event => {
        if (!connection) return // connection closed while receiving event?

        connection.send(
          JSON.stringify({
            type: 'authenticate',
            data: {
              token,
              spaceId,
              userAgent: navigator.userAgent,
              clientAgent: '@workgrid/unity/0.0.0'
            }
          })
        )

        interval = setInterval(() => {
          if (!connection) return
          connection.send(JSON.stringify({ type: 'ping' }))
        }, 60 * 1000)
      }

      connection.onerror = () => {
        interval && clearInterval(interval)
        this.connection = undefined
      }

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
   * @param trigger event name
   * @param callback listener
   */
  subscribe(trigger: string, callback: (...args: any[]) => void) {
    this.connect()

    this.emitter.on(trigger, callback)
    return () => this.emitter.off(trigger, callback)
  }
}

export default WorkgridWS

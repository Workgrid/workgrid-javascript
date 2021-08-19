/**
 * Copyright 2020 Workgrid Software
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

import emitter, { Handler } from './emitter'
import niceTry from 'nice-try'
import { debug } from 'debug'
import { v4 as uuid } from 'uuid'
import ms from 'ms'

const logger = debug('courier') // default logger namespace
const is = (object: unknown, type: string) => Object.prototype.toString.call(object) === `[object ${type}]`
const isMessagePort = (object: unknown): object is MessagePort => niceTry(() => is(object, 'MessagePort')) || false

// Error Codes
// APP-10: Message could not be handled (missing `type` and `parentId`)
// APP-11: Could not parse event
// APP-12: Unable to post message to target
// APP-13: Target is not an expected source
// APP-14: Timed out waiting for a response
// APP-15: Message received from unexpected source
// APP-16: Handler responded with an error
// APP-17: Reply could not be sent (missing `id`)

export { Handler }

/**
 * @beta
 */
export type Destination =
  | {
      postMessage(message: unknown, targetOrigin: string, transfer?: Transferable[]): void
    }
  | {
      postMessage(message: unknown, transfer: Transferable[]): void
      postMessage(message: unknown, options?: PostMessageOptions): void
    }

/**
 * @beta
 */
export type Host = {
  addEventListener(type: 'message', listener: (event: MessageEvent) => void): void
  removeEventListener(type: 'message', listener: (event: MessageEvent) => void): void
}

/**
 * @beta
 */
export interface CourierOptions {
  /**
   * Duration to wait for a response
   */
  timeout?: number

  /**
   * Predefined list of expected message sources
   */
  sources?: Destination[]

  /**
   * Predefined list of hosts to listen on
   */
  hosts?: Host[]

  /**
   * Custom log group
   */
  id?: string
}

/**
 * Create a new instance of Courier (the Workgrid messenger).
 *
 * @beta
 */
export default class Courier {
  private debug: debug.Debugger
  private timeout: number
  private sources: Destination[]
  private hosts: Host[]
  private internal: ReturnType<typeof emitter>
  private emitter: ReturnType<typeof emitter>

  public static debug = debug // TODO: Replace with `logger` instance variable

  public constructor({ timeout, sources, hosts, id }: CourierOptions = {}) {
    this.debug = id ? logger.extend(id) : logger // ¯\_(ツ)_/¯
    this.debug('constructor', { timeout, sources, hosts })

    this.timeout = timeout || ms('10 seconds')
    this.sources = sources || [global.window.parent]
    this.hosts = hosts || [global.window]

    this.internal = emitter()
    this.emitter = emitter()

    this.handleMessage = this.handleMessage.bind(this)
    this.setup()
  }

  /**
   * Set up the host message listeners.
   */
  public setup(): void {
    this.debug('setup', {})

    this.hosts.forEach((host) => {
      host.addEventListener('message', this.handleMessage)
    })
  }

  /**
   * Tear down the host message listeners.
   */
  public teardown(): void {
    this.debug('teardown', {})

    this.hosts.forEach((host) => {
      host.removeEventListener('message', this.handleMessage)
    })
  }

  /**
   * Add a message source.
   */
  public register(sourceOrIFrame: Destination | HTMLIFrameElement): void {
    this.debug('register', { sourceOrIFrame })

    if (!sourceOrIFrame) return
    // const source = !is(sourceOrIFrame, 'Window') ? sourceOrIFrame.contentWindow : sourceOrIFrame
    const source = niceTry(() => (sourceOrIFrame as HTMLIFrameElement).contentWindow) || (sourceOrIFrame as Destination)
    if (!this.sources.includes(source)) this.sources.push(source)
  }

  /**
   * Remove a message source.
   */
  public unregister(sourceOrIFrame: Destination | HTMLIFrameElement): void {
    this.debug('unregister', { sourceOrIFrame })

    if (!sourceOrIFrame) return
    // const source = !is(sourceOrIFrame, 'Window') ? sourceOrIFrame.contentWindow : sourceOrIFrame
    const source = niceTry(() => (sourceOrIFrame as HTMLIFrameElement).contentWindow) || (sourceOrIFrame as Destination)
    this.sources.splice(this.sources.indexOf(source) >>> 0, 1)
  }

  /**
   * Start listening for an event.
   */
  public on(type: string, handler: Handler): void {
    this.debug('on', { type, handler })

    this.emitter.on(type, handler)
  }

  /**
   * Stop listening for an event.
   */
  public off(type: string, handler?: Handler): void {
    this.debug('off', { type, handler })

    this.emitter.off(type, handler)
  }

  /**
   * Send a message (response ignored).
   */
  public emit({ type, payload, target }: { type: string; payload?: unknown; target?: Destination }) {
    this.debug('emit', { type, payload, target })

    const message = { type, payload }
    this.sendMessage(message, target)
  }

  /**
   * Send a message (response expected).
   */
  public send({
    type,
    payload,
    target,
    timeout,
  }: {
    type: string
    payload?: unknown
    target?: Destination
    timeout?: number
  }): Promise<unknown> {
    this.debug('send', { type, payload, target, timeout })

    const message = { id: uuid(), type, payload }
    const event = { data: message } // for errors

    const promise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout((): void => {
        this.internal.off(message.id)
        reject(this.error('APP-14', { event }))
      }, timeout || this.timeout)

      this.internal.on(message.id, (error: unknown, data: unknown): void => {
        clearTimeout(timeoutId)
        this.internal.off(message.id)
        if (!error) return resolve(data)
        reject(this.error('APP-16', { event, error, data }))
      })

      let transfer: Transferable[] = []

      if ('MessageChannel' in global) {
        const channel = new MessageChannel()

        channel.port1.onmessage = (event): void => {
          this.debug('onmessage', { event, target, channel })

          // sendMessage defaults target to the first registered source
          // we need to apply the same logic here so source is consistent
          target = target || this.sources[0]

          // TODO: Passing a new instance of MessageEvent doesn't work in react-native :(
          // this.handleMessage(new MessageEvent('message', { data: event.data, source: target }))
          this.handleMessage({ data: event.data, source: target } as MessageEvent)
        }

        transfer = [channel.port2]
      }

      this.sendMessage(message, target, transfer)
    })

    return promise
  }

  /**
   * Create a new error object with the given arguments, and fire an error event.
   */
  private error(code: string, ...args: unknown[]): Error {
    this.debug('error', { code, args })

    const error = new Error(code)
    Object.assign(error, ...args)

    this.emitter.emit('error', error)
    return error
  }

  /**
   * Send a message to the given target, with the given data and trasferables.
   * If the target supplied is not a registered source, an error will be thrown.
   */
  private sendMessage(data: unknown, target?: Destination, transfer?: Transferable[]): void {
    this.debug('sendMessage', { data, target })

    target = target || this.sources[0]

    if (!isMessagePort(target) && !this.sources.includes(target)) {
      throw this.error('APP-13', { target })
    }

    try {
      if (isMessagePort(target)) {
        this.debug('postMessage', { target, data })
        target.postMessage(JSON.stringify(data))
      } else {
        this.debug('postMessage', { target, data, transfer })
        target.postMessage(JSON.stringify(data), '*', transfer)
      }
    } catch (error) {
      throw this.error('APP-12', { error, target, transfer })
    }
  }

  /**
   * Process a message event and emit or invoke to the appropriate handlers.
   * This method will be called when the registered hosts receive a message.
   */
  public handleMessage(event: MessageEvent & ({ data: unknown } | { nativeEvent: { data: unknown } })): void {
    this.debug('handleMessage', { event })

    // event.source will be null in tests
    // https://github.com/jsdom/jsdom/pull/1140
    if (!event.source || !this.sources.includes(event.source)) {
      this.error('APP-15', { event })
      return
    }

    // https://facebook.github.io/react-native/docs/webview#onmessage
    let data = 'nativeEvent' in event ? event.nativeEvent.data : event.data
    try {
      if (typeof data === 'string') data = JSON.parse(data)
    } catch (error) {
      this.error('APP-11', { event, error })
      return
    }

    // Response
    if (data && data.parentId) {
      this.internal.emit(data.parentId, data.error, data.payload)
      return
    }

    // Incoming
    if (data && data.type) {
      this.emitter.invoke(data.type, async (handler) => {
        let payload
        let error

        try {
          // TODO: Passing a new instance of MessageEvent doesn't work in react-native :(
          // payload = await handler(new MessageEvent('message', { source: event.source, data }))
          payload = await handler({ source: event.source, data })
        } catch (e) {
          error = e
        }

        if (!data.id) {
          this.error('APP-17', { event, error, payload })
          return
        }

        const target = (event.ports && event.ports[0]) || event.source
        this.sendMessage({ parentId: data.id, payload, error }, target)
      })
      return
    }

    this.error('APP-10', { event })
    return
  }
}

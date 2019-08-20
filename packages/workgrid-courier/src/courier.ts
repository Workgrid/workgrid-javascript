import emitter from './emitter'
import niceTry from 'nice-try'
import debug from 'debug/dist/debug'
import uuid from 'uuid/v4'
import ms from 'ms'
import { assign, includes } from 'lodash'

const logger = debug('courier') // default logger namespace
const is = (object: any, type: string): boolean => Object.prototype.toString.call(object) === `[object ${type}]`

// Error Codes
// APP-10: Message could not be handled (missing `type` and `parentId`)
// APP-11: Could not parse event
// APP-12: Unable to post message to target
// APP-13: Target is not an expected source
// APP-14: Timed out waiting for a response
// APP-15: Message received from unexpected source
// APP-16: Handler responded with an error
// APP-17: Reply could not be sent (missing `id`)

/**
 * Create a new instance of Courier (the Workgrid messenger).
 *
 * @param {Object}    options
 * @param {Number}    [options.timeout=10s] - Duration to wait for a response
 * @param {Object[]}  [options.sources=[window.parent]] - Predefined list of expected message sources
 * @param {Object[]}  [options.hosts=[window]] - Predefined list of hosts to listen on
 * @param {string}    [options.id=] - Custom log group
 */
export default class Courier {
  private debug: any
  private timeout: number
  private sources: any[]
  private hosts: any[]
  private internal: any
  private emitter: any

  public static debug = debug // TODO: Replace with `logger` instance variable

  public constructor({
    timeout,
    sources,
    hosts,
    id
  }: { timeout?: number; sources?: any[]; hosts?: any[]; id?: string } = {}) {
    this.debug = id ? logger.extend(id) : logger // ¯\_(ツ)_/¯
    this.debug('constructor', { timeout, sources, hosts })

    this.timeout = timeout || ms('10 seconds')
    this.sources = sources || [self.window.parent]
    this.hosts = hosts || [self.window]

    this.internal = emitter()
    this.emitter = emitter()

    this.setup()
  }

  /**
   * Set up the host message listeners.
   */
  public setup = (): void => {
    this.debug('setup', {})

    this.hosts.forEach((host: any): void => {
      host.addEventListener('message', this.handleMessage)
    })
  }

  /**
   * Tear down the host message listeners.
   */
  public teardown = (): void => {
    this.debug('teardown', {})

    this.hosts.forEach((host: any): void => {
      host.removeEventListener('message', this.handleMessage)
    })
  }

  /**
   * Add a message source.
   *
   * @param {Object} source
   */
  public register = (source: any): void => {
    this.debug('register', { source })

    if (!source) return
    // if (!is(source, 'Window')) source = source.contentWindow
    source = niceTry((): Window => source.contentWindow) || source
    if (!includes(this.sources, source)) this.sources.push(source)
  }

  /**
   * Remove a message source.
   *
   * @param {Object} source
   */
  public unregister = (source: any): void => {
    this.debug('unregister', { source })

    if (!source) return
    // if (!is(source, 'Window')) source = source.contentWindow
    source = niceTry((): Window => source.contentWindow) || source
    this.sources.splice(this.sources.indexOf(source) >>> 0, 1)
  }

  /**
   * Start listening for an event.
   *
   * @param {string}   type - The event type
   * @param {function} handler - The event handler
   */
  public on = (type: string, handler: Function): void => {
    this.debug('on', { type, handler })

    this.emitter.on(type, handler)
  }

  /**
   * Stop listening for an event.
   *
   * @param {string}   type - The event type
   * @param {function} [handler] - The event handler
   */
  public off = (type: string, handler?: Function): void => {
    this.debug('off', { type, handler })

    this.emitter.off(type, handler)
  }

  /**
   * Send a message (response ignored).
   *
   * @param {Object}   options
   * @param {string}   options.type - The event type
   * @param {*}        [options.payload] - A JSON serializable event payload
   * @param {Object}   [options.target] - An optional target (will default to the first registered source)
   */
  public emit = ({ type, payload, target }: { type: string; payload?: any; target?: any }): void => {
    this.debug('emit', { type, payload, target })

    const message = { type, payload }
    this.sendMessage(message, target)
  }

  /**
   * Send a message (response expected).
   *
   * @param {Object}   options
   * @param {string}   options.type - The event type
   * @param {*}        [options.payload] - A JSON serializable event payload
   * @param {Object}   [options.target] - A custom target (will default to the first registered source)
   * @param {Number}   [options.timeout] - Override the default timeout
   */
  public send = ({
    type,
    payload,
    target,
    timeout
  }: {
    type: string
    payload?: any
    target?: any
    timeout?: number
  }): Promise<any> => {
    this.debug('send', { type, payload, target, timeout })

    const message = { id: uuid(), type, payload }
    const event = { data: message } // for errors

    const promise = new Promise((resolve: Function, reject: Function): void => {
      const timeoutId = setTimeout((): void => {
        this.internal.off(message.id)
        reject(this.error('APP-14', { event }))
      }, timeout || this.timeout)

      this.internal.on(message.id, (error: any, data: any): void => {
        clearTimeout(timeoutId)
        this.internal.off(message.id)
        if (!error) return resolve(data)
        reject(this.error('APP-16', { event, error, data }))
      })

      let transfer: Transferable[] = []

      if ('MessageChannel' in self) {
        const channel = new MessageChannel()

        channel.port1.onmessage = (event: any): void => {
          this.debug('onmessage', { event, target, channel })

          // TODO: Passing a new instance of MessageEvent doesn't work in react-native :(
          // this.handleMessage(new MessageEvent('message', { data: event.data, source: target }))
          this.handleMessage({ data: event.data, source: target })
        }

        transfer = [channel.port2]
      }

      this.sendMessage(message, target, transfer)
    })

    return promise
  }

  /**
   * Create a new error object with the given arguments, and fire an internal error event.
   *
   * @param {string} code - The error code
   * @param {...any} args - Additional properties attached to the error
   */
  private error = (code: string, ...args: any[]): any => {
    this.debug('error', { code, args })

    const error = new Error(code)
    assign(error, ...args)

    this.emitter.emit('error', error)
    return error
  }

  /**
   * Send a message to the given target, with the given data and trasferables.
   * If the target supplied is not a registered source, an error will be thrown.
   *
   * @param {Object} [data] - The serializable event to be sent
   * @param {Object} [target] - A custom target (will default to the first registered source)
   * @param {Transferable[]} [transfer] - Used to pass a MessageChannel port
   */
  private sendMessage = (data: any, target?: any, transfer?: Transferable[]): void => {
    this.debug('sendMessage', { data, target })

    target = target || this.sources[0]
    // We must nice-try this one for Edge
    const isMessagePort = niceTry((): boolean => is(target, 'MessagePort')) || false
    if (!isMessagePort && !includes(this.sources, target)) {
      throw this.error('APP-13', { target })
    }

    try {
      if (isMessagePort) {
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
   *
   * @param {Object} event
   * @param {Object} event.source - The message source
   * @param {Object} event.data - The message data
   * @param {string} [event.data.id] - The id to use if a response is sent
   * @param {string} [event.data.type] - The type used to identify the appropriate handlers
   * @param {*}      [event.data.payload] - Arbitrary data included with the event
   * @param {string} [event.data.parentId] - The id of the message being responded to
   */
  public handleMessage = (event: any): any => {
    this.debug('handleMessage', { event })

    // event.source will be null in tests
    // https://github.com/jsdom/jsdom/pull/1140
    if (event.source && !includes(this.sources, event.source)) {
      // throw this.error('APP-15', { source: event.source })
      return this.error('APP-15', { source: event.source })
    }

    // https://facebook.github.io/react-native/docs/webview#onmessage
    let data = event.nativeEvent ? event.nativeEvent.data : event.data
    try {
      if (typeof data === 'string') data = JSON.parse(data)
    } catch (error) {
      // throw this.error('APP-11', { error })
      return this.error('APP-11', { error })
    }

    // Response
    if (data && data.parentId) {
      this.internal.emit(data.parentId, data.error, data.payload)
      return
    }

    // Incoming
    if (data && data.type) {
      this.emitter.invoke(
        data.type,
        async (handler: Function): Promise<void> => {
          let payload
          let error

          try {
            // TODO: Passing a new instance of MessageEvent doesn't work in react-native :(
            // payload = await handler(new MessageEvent('message', { source: event.source, data }))
            payload = await handler({ source: event.source, data })
          } catch (e) {
            error = e
          }

          if (!data.id) return this.debug('APP-17', { event, payload, error })

          const target = (event.ports && event.ports[0]) || event.source
          this.sendMessage({ parentId: data.id, payload, error }, target)
        }
      )
      return
    }

    // throw this.error('APP-10', { event })
    return this.error('APP-10', { event })
  }
}

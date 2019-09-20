import ms from 'ms'
import pAny from 'p-any'
import queue from './queue'
import Courier from '@workgrid/courier'
import pFinally from 'p-finally'
import jwtDecode from 'jwt-decode'
import PCancelable from 'p-cancelable'
import ResizeObserver from 'resize-observer-polyfill'
import { throttle, remove, invokeMap } from 'lodash'

const EVENTS = {
  READY: 'ready',
  ERROR: 'error',
  SET_SIZE: 'setSize',
  SHOW_DETAIL: 'showDetail',
  HIDE_DETAIL: 'hideDetail',
  UPDATE_TITLE: 'updateTitle',
  REFRESH_TOKEN: 'refreshToken'
}

const READY_TIMEOUT = ms('10s')
const READY_INTERVAL = ms('100ms')

const isExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token)
    return decoded.exp < Date.now() / 1000
  } catch (e) {
    return true
  }
}

/**
 * @beta
 */
export interface MicroAppOptions {
  /**
   * Custom error handler
   */
  onError?: Function

  /**
   * Custom log group
   */
  id?: string
}

/**
 * Create a new instance of the Micro App library.
 *
 * @beta
 */
class MicroApp {
  public courier: any // for testing :(
  private queue: any
  private ro: any
  private token?: string

  public constructor({ onError, id }: MicroAppOptions = {}) {
    const noop = (): void => {}
    this.courier = new Courier({ id })
    this.courier.on('error', onError || noop)

    this.queue = queue()
    this.ro = new ResizeObserver(this.handleResize)
  }

  /**
   * Set up the communication channel with Workgrid.
   * A loading overlay will be displayed until `initialize` is invoked.
   */
  public initialize = (): void => {
    // Tell the host we're ready
    this.ready().then((): void => {
      // Flush the queue
      this.queue.flush()

      // Listen for resize
      this.subscribe()
    })
  }

  /**
   * Start the resize observer
   */
  private subscribe = (): Function => {
    this.ro.observe(window.document.documentElement)
    return this.unsubscribe // why not... lol
  }

  /**
   * Stop the resize observer
   */
  private unsubscribe = (): void => {
    this.ro.disconnect()
  }

  /**
   * Set the current height on resize
   */
  private handleResize = throttle((entries: any[]): void => {
    const mainElement = entries[0].target
    const height = mainElement.offsetHeight

    this.emit({ type: EVENTS.SET_SIZE, payload: { height } })
  }, 1000)

  /**
   * Retrieve a token to validate the user in your API.
   * The token will be a JWT that includes `email`, `workgrid_space_id` and `workgrid_tenant_id`.
   */
  public getToken = async (): Promise<string> => {
    if (this.token && !isExpired(this.token)) return this.token
    return (this.token = (await this.send({ type: EVENTS.REFRESH_TOKEN })) as string)
  }

  /**
   * Update the title of the detail panel. This will let you reflect
   */
  public updateTitle = (title: string): void => {
    this.emit({ type: EVENTS.UPDATE_TITLE, payload: { title } })
  }

  /**
   * Show the detail with the given url and optional title.
   * The page shown must also be configured as a micro app, otherwise an error will be thrown.
   */
  public showDetail = ({ url, title }: { url: string; title?: string }): void => {
    if (!url) throw new Error('URL is required to show details')
    this.emit({ type: EVENTS.SHOW_DETAIL, payload: { title, url } })
  }

  /**
   * Hide the detail if it's visible.
   */
  public hideDetail = (): void => {
    this.emit({ type: EVENTS.HIDE_DETAIL })
  }

  // Private API

  /**
   * Wrap the event emitter in a queue that is flushed when the host is ready.
   */
  private emit = (...args: any[]): void => {
    this.queue.push((): void => {
      this.courier.emit(...args)
    })
  }

  /**
   * Wrap the event sender in a queue that is flushed when the host is ready.
   */
  public send = (...args: [any]): Promise<any> => {
    return new PCancelable((resolve: Function, reject: Function, onCancel: Function): void => {
      const fn = (): void => {
        this.courier.send(...args).then(resolve, reject)
      }

      onCancel((): void => {
        remove(this.queue.queue, fn)
      })

      this.queue.push(fn)
    })
  }

  /**
   * Tell the host we're ready every 100ms until the message is acknowledged.
   * This fires off two techniques "serial" and "cascade", Android needs serial for now; cascade is superior
   */
  public ready = (): Promise<any> => {
    return new PCancelable((resolve: Function, reject: Function, onCancel: Function): void => {
      const payload = { height: window.document.documentElement.offsetHeight }
      const promises = [this.courier.send({ type: EVENTS.READY, payload })]

      const interval = setInterval((): void => {
        promises.push(this.courier.send({ type: EVENTS.READY, payload }))
        if (promises.length >= READY_TIMEOUT / READY_INTERVAL) clearInterval(interval)
      }, READY_INTERVAL)

      onCancel((): void => {
        interval && clearInterval(interval)
        invokeMap(promises, 'cancel')
      })

      pFinally(pAny(promises), (): void => {
        interval && clearInterval(interval)
        invokeMap(promises, 'cancel')
      }).then(resolve, reject)
    })
  }
}

export default MicroApp

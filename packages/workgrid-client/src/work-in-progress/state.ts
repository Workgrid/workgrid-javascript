import ms from 'ms'
import { EventEmitter } from 'events'

import WorkgridClient from './client'
import { QueryHandler, MutationHandler, SubscriptionHandler } from './handlers'

export type QueryConfig = { enabled?: boolean; variables: { [key: string]: any } }
export type MutationConfig = { enabled?: boolean; variables: { [key: string]: any } }
export type SubscriptionConfig = { enabled?: boolean; variables: { [key: string]: any } }

type StateAction = { type: 'success'; data: any } | { type: 'error'; error: any } | { type: 'reset' }

class State<
  HandlerType extends QueryHandler | MutationHandler | SubscriptionHandler,
  ConfigType extends QueryConfig | MutationConfig | SubscriptionConfig
> {
  protected handler: HandlerType
  protected client: WorkgridClient
  protected config: ConfigType
  protected emitter = new EventEmitter()

  // used to limit `execute` to a single concurrent invocation
  protected promise: Promise<void> | undefined

  state: {
    status: 'loading' | 'success' | 'error'
    data?: any
    error?: any
  } = {
    status: 'loading'
  }

  constructor(handler: HandlerType, client: WorkgridClient, config: ConfigType) {
    this.handler = handler
    this.client = client
    this.config = config
  }

  get status() {
    return this.state.status
  }

  get isLoading() {
    return this.state.status === 'loading'
  }

  get isSuccess() {
    return this.state.status === 'success'
  }

  get isError() {
    return this.state.status === 'error'
  }

  get data() {
    const data = this.state.data
    const transformData = this.handler.transformData
    return transformData ? transformData(data) : data
  }

  set data(data) {
    this.dispatch({ type: 'success', data })
  }

  get error() {
    const error = this.state.error
    const transformError = this.handler.transformError
    return transformError ? transformError(error) : error
  }

  set error(error) {
    this.dispatch({ type: 'error', error })
  }

  reset() {
    this.dispatch({ type: 'reset' })
  }

  subscribe(callback: (...args: any[]) => void) {
    this.emitter.on('*', callback)
    return () => {
      this.emitter.off('*', callback)
    }
  }

  dispatch(action?: StateAction) {
    if (action) {
      switch (action.type) {
        case 'success':
          this.state = {
            ...this.state,
            data: action.data,
            status: 'success'
          }
          break
        case 'error':
          this.state = {
            ...this.state,
            error: action.error,
            status: 'error'
          }
          break
        case 'reset':
          this.state = {
            status: 'loading'
          }
          break
      }
    }

    this.emitter.emit('*')
  }
}

export class QueryState extends State<QueryHandler, QueryConfig> {
  getFetchMore() {
    const data = this.state.data as any
    const variables = this.config.variables
    const getFetchMore = this.handler.getFetchMore

    if (!data || !getFetchMore) return undefined
    return getFetchMore(variables, data.slice(-1)[0])
  }

  stale?: Number | Boolean

  // Extend State for "stale" queries
  get isStale() {
    return !this.stale || this.stale <= Date.now()
  }

  // Extended State for "infinite" queries
  get canFetchMore() {
    return this.getFetchMore() !== undefined
  }

  isFetchingMore = false
  // let isFetchingMore = false

  // Object.defineProperty(state, 'isFetchingMore', {
  //   get: () => isFetchingMore
  // })

  // async fetchMore() {
  //   if (!this.canFetchMore) return
  //   return this.execute({ fetchMore: true })

  //   // try {
  //   //   isFetchingMore = true
  //   //   state.dispatch()
  //   //   return await state.execute({ fetchMore: true })
  //   // } finally {
  //   //   isFetchingMore = false
  //   //   state.dispatch()
  //   // }
  // }
  fetchMore = async () => {
    if (!this.canFetchMore) return
    return this.execute({ fetchMore: true })

    // try {
    //   isFetchingMore = true
    //   state.dispatch()
    //   return await state.execute({ fetchMore: true })
    // } finally {
    //   isFetchingMore = false
    //   state.dispatch()
    // }
  }

  execute(options: { fetchMore?: Boolean } = {}) {
    if (this.promise) return this.promise
    if (this.config.enabled === false) return

    // TODO: Stale and Infinite queries do not play well at the moment
    if (!this.isStale && !options.fetchMore) return

    this.promise = (async () => {
      let variables = options.fetchMore ? this.getFetchMore()! : this.config.variables // getFetchMore will not be undefind if fetchMore is true

      let optimisticUpdate // capture the update for success commit / error revert
      if (this.handler.onQuery) optimisticUpdate = this.handler.onQuery(this.client, variables)

      try {
        let data = this.handler.initialData ? this.handler.initialData(this.client, variables) : undefined
        if (data === undefined) data = await this.handler.execute(this.client, variables)
        data = this.handler.getFetchMore ? (options.fetchMore ? [...(this.state.data as any), data] : [data]) : data
        this.data = data // automatically dispatches
        this.stale = Date.now() + (this.handler.staleTime || ms('30 seconds'))
        if (this.handler.onSuccess) this.handler.onSuccess(this.client, variables, optimisticUpdate)
      } catch (error) {
        this.error = error // automatically dispatches
        this.stale = Date.now() + (this.handler.staleTime || ms('30 seconds'))
        if (this.handler.onError) this.handler.onError(this.client, variables, optimisticUpdate)
      }

      this.promise = undefined
    })()
  }
}

export class MutationState extends State<MutationHandler, MutationConfig> {
  execute(options: {} = {}) {
    if (this.promise) return this.promise
    if (this.config.enabled === false) return

    this.promise = (async () => {
      const variables = this.config.variables

      let optimisticUpdate // capture the update for success commit / error revert
      if (this.handler.onMutate) optimisticUpdate = this.handler.onMutate(this.client, variables)

      try {
        const data = await this.handler.execute(this.client, variables)
        this.data = data // automatically dispatches
        if (this.handler.onSuccess) this.handler.onSuccess(this.client, variables, optimisticUpdate)
      } catch (error) {
        this.error = error // automatically dispatches
        if (this.handler.onError) this.handler.onError(this.client, variables, optimisticUpdate)
      }

      this.promise = undefined
    })()
  }
}

export class SubscriptionState extends State<SubscriptionHandler, SubscriptionConfig> {
  execute(options: {} = {}) {
    if (this.promise) return this.promise
    if (this.config.enabled === false) return

    this.promise = (async () => {
      const variables = this.config.variables

      // This api is kind of weird, you can await subscribe to get the first data...
      // Not sure if this is actually useful, but it sort of matches the react api /shrug
      await this.handler.execute(this.client, variables, (data: any) => {
        this.data = data // automatically dispatches
        if (this.handler.onSubscriptionData) this.handler.onSubscriptionData(this.client, variables, data)
      })

      // Subscriptions are a singleton
      // promise = undefined
    })()
  }
}

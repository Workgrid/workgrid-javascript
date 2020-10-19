/**
 * The types for this package have gotten very complex
 * To avoid excessive duplication, I've been trying to rely on inference
 * This works okay in a lot of situations, and is made even more powerful in typescript 4.1
 * but there are a lot of places where this can just be confusing, or cause circular references :(
 *
 * Some high-level design goals
 * - The react implementation should be a separate wrapper on top of a generic client
 * - The cache should be plain objects / serializable (to allow for persistance and hydration)
 * - Question: Should it be possible to extend the client with additional handlers...?
 *
 * Inspired by react-query, swr and apollo-client
 */

type ContextValue = { token: string; spaceId: string; companyCode: string }
type Context = ContextValue | (() => Promise<ContextValue>)

type ClientOptions = {
  context: Context
  cache?: Map<string, any>
}

type Handler<TData> = {
  transformData?(data: TData): any
  transformError?(error: any): any
}

type QueryHandler<TVariables = any, TData = any> = Handler<TData> & {
  execute(client: Client, variables: TVariables): Promise<TData>
  initialData?(client: Client, variables: TVariables): TData | undefined
  getFetchMore?(variables: TVariables, data: TData): TVariables | undefined

  onQuery?(client: Client, variables: TVariables): any
  onSuccess?(client: Client, variables: TVariables, optimisticUpdate: any): void
  onError?(client: Client, variables: TVariables, optimisticUpdate: any): void

  staleTime?: number
}

type MutationHandler<TVariables = any, TData = any> = Handler<TData> & {
  execute(client: Client, variables: TVariables): Promise<TData>

  onMutate?(client: Client, variables: TVariables): any
  onSuccess?(client: Client, variables: TVariables, optimisticUpdate: any): void
  onError?(client: Client, variables: TVariables, optimisticUpdate: any): void
}

type SubscriptionHandler<TVariables = any, TData = any> = Handler<TData> & {
  execute(client: Client, variables: TVariables, callback: (data: TData) => void): Promise<TData>

  onSubscriptionData?(client: Client, variables: TVariables, data: TData): void
}

const queries = {
  a: {
    async execute(client, variables) {
      console.log({ client, variables })
      return 1
    },
  } as QueryHandler<{ id: string }>,
}
const mutations = {
  b: {
    execute(client, variables) {
      console.log({ client, variables })
    },
  } as MutationHandler,
}
const subscriptions = {
  c: {
    execute(client, variables, callback) {
      console.log({ client, variables, callback })
    },
  } as SubscriptionHandler,
}

class Action {
  state: {
    status: 'loading' | 'success' | 'error'
    data?: any
    error?: any
  } = {
    status: 'loading',
  }

  constructor(state: any = {}) {
    this.state = state
  }
}

class Query extends Action {}
class Mutation extends Action {}
class Subscription extends Action {}

type Queries = typeof queries
type QueryKeys = keyof Queries
type Mutations = typeof mutations
type MutationKeys = keyof Mutations
type Subscriptions = typeof subscriptions
type SubscriptionKeys = keyof Subscriptions

type TypeName = QueryKeys | MutationKeys | SubscriptionKeys

type ObjectType<T> = T extends QueryKeys
  ? Query
  : T extends MutationKeys
  ? Mutation
  : T extends SubscriptionKeys
  ? Subscription
  : never

type VariablesType<T> = T extends QueryKeys
  ? Parameters<typeof queries[T]['execute']>[1]
  : T extends MutationKeys
  ? Parameters<typeof mutations[T]['execute']>[1]
  : T extends SubscriptionKeys
  ? Parameters<typeof subscriptions[T]['execute']>[1]
  : never

class Client {
  readonly context: Context
  readonly cache: Map<string, any>

  constructor({ context, cache }: ClientOptions) {
    this.context = context
    this.cache = cache || new Map()
  }

  async query(key: keyof typeof queries) {
    console.log(key)
    this.get([key, { id: '1' }])
  }

  async mutate(key: keyof typeof mutations) {
    console.log(key)
  }

  async subscribe(key: keyof typeof subscriptions) {
    console.log(key)
  }

  // get<T extends TypeName>([key, variables]: [T, any]): ObjectType<T> {
  get<T extends TypeName, TVariables extends VariablesType<T>>([key, variables]: [T, TVariables]): ObjectType<T> {
    if (key in queries) {
      const cacheKey = JSON.stringify([key, variables])
      return new Query(this.cache.get(cacheKey)) as ObjectType<T>
    }
    if (key in mutations) {
      const cacheKey = JSON.stringify([key, variables])
      return new Mutation(this.cache.get(cacheKey)) as ObjectType<T>
    }
    if (key in subscriptions) {
      const cacheKey = JSON.stringify([key, variables])
      return new Subscription(this.cache.get(cacheKey)) as ObjectType<T>
    }
    throw new Error(`Unknown key: ${key}`)
  }

  set<T extends TypeName>(key: T, value: any) {
    return this.cache.set(key, value)
  }

  has<T extends TypeName>(key: T) {
    return this.cache.has(key)
  }

  delete<T extends TypeName>(key: T) {
    return this.cache.delete(key)
  }
  // create()
  // delete()
}

export default Client

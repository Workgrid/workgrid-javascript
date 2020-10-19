import * as queryHandlers from './queries'
import type { QueryHandler } from './queries'
import * as mutationHandlers from './mutations'
import type { MutationHandler } from './mutations'
import * as subscriptionHandlers from './subscriptions'
import type { SubscriptionHandler } from './subscriptions'

export type Handler<Data> = {
  transformData?(data: Data): any
  transformError?(error: any): any
}

type Handlers<Handlers> = { [Key in keyof Handlers]: Handlers[Key] }

const queries: Handlers<typeof queryHandlers> = queryHandlers
const mutations: Handlers<typeof mutationHandlers> = mutationHandlers
const subscriptions: Handlers<typeof subscriptionHandlers> = subscriptionHandlers

export { queries, mutations, subscriptions }
export type { QueryHandler, MutationHandler, SubscriptionHandler }

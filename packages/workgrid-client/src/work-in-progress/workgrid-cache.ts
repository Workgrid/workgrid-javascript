import stringify from 'fast-json-stable-stringify'
import { QueryState, MutationState, SubscriptionState } from './state'

type CacheKey = [string, any?]
type CacheValue = QueryState | MutationState | SubscriptionState

class WorkgridCache {
  private cache = new Map<String, CacheValue>()

  /**
   * Hash the cache key and check if its in the cache
   *
   * @param key cache key
   */
  has(key: CacheKey) {
    const hash = serialize(key)
    return this.cache.has(hash)
  }

  /**
   * Hash the cache key and return the associated state object
   *
   * @param key cache key
   */
  get<Type extends CacheValue>(key: CacheKey) {
    const hash = serialize(key)
    return this.cache.get(hash) as Type
  }

  /**
   * Hash the cache key and store the associated state object
   *
   * @param key cache key
   * @param value state object
   */
  set<Type extends CacheValue>(key: CacheKey, value: Type) {
    const hash = serialize(key)
    return this.cache.set(hash, value)
  }

  /**
   * Hash the cache key and delete it from the cache
   *
   * @param key cache key
   */
  delete(key: CacheKey) {
    const hash = serialize(key)
    return this.cache.delete(hash)
  }

  /**
   * Return the cache item if it exists, or initialize a new item and store it.
   *
   * @param key cache key
   * @param initialValue initial value or function that returns the initial value
   */
  create<Type extends CacheValue>(key: CacheKey, initialValue: Type | (() => Type)): Type {
    if (this.has(key)) {
      return this.get<Type>(key)
    }

    if (typeof initialValue === 'function') {
      initialValue = initialValue()
    }

    this.set(key, initialValue)
    return initialValue
  }
}

export default WorkgridCache

function serialize([key, variables = {}]: CacheKey) {
  return stringify([key, variables])
}

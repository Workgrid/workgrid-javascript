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
import { QueryState, MutationState, SubscriptionState } from './state';
declare type CacheKey = [string, any?];
declare type CacheValue = QueryState | MutationState | SubscriptionState;
declare class WorkgridCache {
    private cache;
    /**
     * Hash the cache key and check if its in the cache
     *
     * @param key cache key
     */
    has(key: CacheKey): boolean;
    /**
     * Hash the cache key and return the associated state object
     *
     * @param key cache key
     */
    get<Type extends CacheValue>(key: CacheKey): Type;
    /**
     * Hash the cache key and store the associated state object
     *
     * @param key cache key
     * @param value state object
     */
    set<Type extends CacheValue>(key: CacheKey, value: Type): Map<string, CacheValue>;
    /**
     * Hash the cache key and delete it from the cache
     *
     * @param key cache key
     */
    delete(key: CacheKey): boolean;
    /**
     * Return the cache item if it exists, or initialize a new item and store it.
     *
     * @param key cache key
     * @param initialValue initial value or function that returns the initial value
     */
    create<Type extends CacheValue>(key: CacheKey, initialValue: Type | (() => Type)): Type;
}
export default WorkgridCache;
//# sourceMappingURL=workgrid-cache.d.ts.map
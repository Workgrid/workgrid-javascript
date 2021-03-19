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
import * as queryHandlers from './queries';
import type { QueryHandler } from './queries';
import * as mutationHandlers from './mutations';
import type { MutationHandler } from './mutations';
import * as subscriptionHandlers from './subscriptions';
import type { SubscriptionHandler } from './subscriptions';
export declare type Handler<Data> = {
    transformData?(data: Data): any;
    transformError?(error: any): any;
};
declare type Handlers<Handlers> = {
    [Key in keyof Handlers]: Handlers[Key];
};
declare const queries: Handlers<typeof queryHandlers>;
declare const mutations: Handlers<typeof mutationHandlers>;
declare const subscriptions: Handlers<typeof subscriptionHandlers>;
export { queries, mutations, subscriptions };
export type { QueryHandler, MutationHandler, SubscriptionHandler };
//# sourceMappingURL=index.d.ts.map
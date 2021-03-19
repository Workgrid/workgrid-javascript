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
/// <reference types="node" />
import { EventEmitter } from 'events';
import WorkgridClient from './client';
import { QueryHandler, MutationHandler, SubscriptionHandler } from './handlers';
export declare type QueryConfig = {
    enabled?: boolean;
    variables: {
        [key: string]: any;
    };
};
export declare type MutationConfig = {
    enabled?: boolean;
    variables: {
        [key: string]: any;
    };
};
export declare type SubscriptionConfig = {
    enabled?: boolean;
    variables: {
        [key: string]: any;
    };
};
declare type StateAction = {
    type: 'success';
    data: any;
} | {
    type: 'error';
    error: any;
} | {
    type: 'reset';
};
declare class State<HandlerType extends QueryHandler | MutationHandler | SubscriptionHandler, ConfigType extends QueryConfig | MutationConfig | SubscriptionConfig> {
    protected handler: HandlerType;
    protected client: WorkgridClient;
    protected config: ConfigType;
    protected emitter: EventEmitter;
    protected promise: Promise<void> | undefined;
    state: {
        status: 'loading' | 'success' | 'error';
        data?: any;
        error?: any;
    };
    constructor(handler: HandlerType, client: WorkgridClient, config: ConfigType);
    get status(): "error" | "loading" | "success";
    get isLoading(): boolean;
    get isSuccess(): boolean;
    get isError(): boolean;
    get data(): any;
    set data(data: any);
    get error(): any;
    set error(error: any);
    reset(): void;
    subscribe(callback: (...args: any[]) => void): () => void;
    dispatch(action?: StateAction): void;
}
export declare class QueryState extends State<QueryHandler, QueryConfig> {
    getFetchMore(): {} | undefined;
    stale?: number | boolean;
    get isStale(): boolean;
    get canFetchMore(): boolean;
    isFetchingMore: boolean;
    fetchMore: () => Promise<void>;
    execute(options?: {
        fetchMore?: boolean;
    }): Promise<void> | undefined;
}
export declare class MutationState extends State<MutationHandler, MutationConfig> {
    execute(options?: {}): Promise<void> | undefined;
}
export declare class SubscriptionState extends State<SubscriptionHandler, SubscriptionConfig> {
    execute(options?: {}): Promise<void> | undefined;
}
export {};
//# sourceMappingURL=state.d.ts.map
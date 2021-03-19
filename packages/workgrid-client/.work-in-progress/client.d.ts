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
import WorkgridCache from './workgrid-cache';
import WorkgridHTTP from './workgrid-http';
import WorkgridWS from './workgrid-ws';
import { QueryConfig, MutationConfig, SubscriptionConfig } from './state';
import { queries, mutations, subscriptions } from './handlers';
export declare type QueryParameters = Parameters<WorkgridClient['query']>;
export declare type MutateParameters = Parameters<WorkgridClient['mutate']>;
export declare type SubscribeParameters = Parameters<WorkgridClient['subscribe']>;
export declare type WorkgridDefaults = {};
export declare type WorkgridContext = {
    token: string;
    spaceId: string;
    companyCode: string;
} | (() => Promise<{
    token: string;
    spaceId: string;
    companyCode: string;
}>);
declare class WorkgridClient {
    readonly defaults?: WorkgridDefaults;
    readonly context: WorkgridContext;
    readonly cache: WorkgridCache;
    readonly http: WorkgridHTTP;
    readonly ws: WorkgridWS;
    constructor({ defaults, context }: {
        defaults?: WorkgridDefaults;
        context: WorkgridContext;
    });
    query(key: keyof typeof queries, config?: QueryConfig): Promise<any>;
    mutate(key: keyof typeof mutations, config?: MutationConfig): Promise<any>;
    subscribe(key: keyof typeof subscriptions, config?: SubscriptionConfig): Promise<any>;
}
export default WorkgridClient;
//# sourceMappingURL=client.d.ts.map
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
import type { Handler } from './index';
import WorkgridClient from '../client';
import { Location } from '../types';
export declare type QueryHandler<Variables = {}, Data = any> = Handler<Data> & {
    execute(client: WorkgridClient, variables: Variables): Promise<Data>;
    initialData?(client: WorkgridClient, variables: Variables): Data | undefined;
    getFetchMore?(variables: Variables, data: Data): Variables | undefined;
    onQuery?(client: WorkgridClient, variables: Variables): any;
    onSuccess?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void;
    onError?(client: WorkgridClient, variables: Variables, optimisticUpdate: any): void;
    staleTime?: number;
};
export declare const getNotifications: QueryHandler<{
    location: Location;
    limit?: number;
    cursor?: string;
}>;
export declare const getNotification: QueryHandler<{
    id: string;
}>;
export declare const getApps: QueryHandler<{
    limit?: number;
    cursor?: string;
}>;
export declare const getApp: QueryHandler<{
    id: string;
}>;
export declare const getActivity: QueryHandler<{
    limit?: number;
    cursor?: string;
}>;
//# sourceMappingURL=queries.d.ts.map
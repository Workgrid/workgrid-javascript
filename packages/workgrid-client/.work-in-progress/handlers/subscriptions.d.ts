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
export declare type SubscriptionHandler<Variables = {}, Data = any> = Handler<Data> & {
    execute(client: WorkgridClient, variables: Variables, callback: (data: Data) => void): Promise<Data>;
    onSubscriptionData?(client: WorkgridClient, variables: Variables, data: Data): void;
};
export declare const badgeUpdate: SubscriptionHandler<{}>;
export declare const newNotification: SubscriptionHandler<{
    location: Location;
}>;
//# sourceMappingURL=subscriptions.d.ts.map
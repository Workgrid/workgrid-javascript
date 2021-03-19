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
import { WorkgridContext } from './client';
import { Location, Notification, App } from './types';
declare class WorkgridHTTP {
    private context;
    private instance;
    constructor({ context }: {
        context: WorkgridContext;
    });
    /**
     * Create a new instance of axios with request and response interceptors.
     * Populate the baseURL and headers from the context, directly return the response data.
     */
    private createInstance;
    /**
     * Get the list of notifications for a given location
     *
     * @param location smart notification location
     * @param options request parameters
     * @param options.limit number of results
     * @param options.cursor result offset
     */
    getNotifications(location: Location, { limit, cursor }?: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        cursor?: string | undefined;
        notifications: Notification[];
    }>;
    /**
     * Get a single notification
     *
     * @param id notification id
     */
    getNotification(id: string): Promise<Notification>;
    /**
     * Action the notification
     *
     * @param id notification id
     * @param data action data
     */
    actionNotification(id: string, data: any): Promise<any>;
    /**
     * Delete the notification
     *
     * @param id notification id
     */
    deleteNotification(id: string): Promise<any>;
    /**
     * Get the users notification activity
     *
     * @param options request parameters
     * @param options.limit number of results
     * @param options.cursor result offset
     */
    getActivity({ limit, cursor }?: {
        limit?: number;
        cursor?: string;
    }): Promise<any>;
    /**
     * Get the users applications
     *
     * @param options request parameters
     * @param options.limit number of results
     * @param options.cursor result offset
     */
    getApps({ limit, cursor }?: {
        limit?: number;
        cursor?: string;
    }): Promise<{
        cursor?: string | undefined;
        apps: App[];
    }>;
    /**
     * Mark the notification as viewed
     *
     * @param id notification id
     */
    notificationViewed(id: string): Promise<any>;
    /**
     * Mark the notification detail as viewed
     *
     * @param id notification id
     */
    notificationDetailViewed(id: string): Promise<any>;
}
export default WorkgridHTTP;
//# sourceMappingURL=workgrid-http.d.ts.map
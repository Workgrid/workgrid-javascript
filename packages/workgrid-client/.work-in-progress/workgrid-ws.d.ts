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
import { WorkgridContext } from './client';
declare class WorkgridWS {
    private context;
    private emitter;
    private connection?;
    constructor({ context }: {
        context: WorkgridContext;
    });
    /**
     * Create a new websocket connection (singleton)
     */
    private connect;
    /**
     * Listen to events for the given trigger
     *
     * @param trigger event name
     * @param callback listener
     */
    subscribe(trigger: string, callback: (...args: any[]) => void): () => EventEmitter;
}
export default WorkgridWS;
//# sourceMappingURL=workgrid-ws.d.ts.map
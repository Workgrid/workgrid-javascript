/**
 * Copyright 2020 Workgrid Software
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

import { map, remove } from 'lodash'

// Calculate the pattern on register
// ================================================================

// TODO: Each `RegExp` is a separate object which breaks `update`...

// export default ({ separator = ':' } = {}) => {
//   const listeners = new Map()

//   return {
//     listeners,

//     on(type, handler) {
//       this.update(type, handlers => {
//         handlers.push(handler)
//         return handlers
//       })
//     },

//     off(type, handler) {
//       this.update(type, handlers => {
//         remove(handlers, value => value === handler)
//         return handler ? handlers : []
//       })
//     },

//     emit(type, ...args) {
//       map([...listeners.entries()], ([pattern, handlers]) => {
//         if (pattern.test(type)) map(handlers, handler => handler(...args))
//       })
//     },

//     invoke(type, callback) {
//       map([...listeners.entries()], ([pattern, handlers]) => {
//         if (pattern.test(type)) map(handlers, handler => callback(handler))
//       })
//     },

//     update(type, updater) {
//       const pattern = new RegExp(`^${type.replace(/\*/g, `[^${separator}]+`)}$`)
//       const handlers = listeners.get(pattern) || []
//       listeners.set(pattern, updater(handlers))
//     }
//   }
// }

// Calculate the pattern on emit
// ================================================================

// export default () => {
//   const listeners = Object.create(null)

//   return {
//     listeners,

//     on(type, handler) {
//       listeners[type] = listeners[type] || []
//       listeners[type].push(handler)
//     },

//     off(type, handler) {
//       if (!handler) delete listeners[type]
//       else remove(listeners[type], value => value === handler)
//     },

//     emit(type, ...args) {
//       map(listeners, (handlers, key) => {
//         if (!new RegExp(`^${key.replace(/\*/g, '\\w+')}$`).test(type)) return
//         map(handlers, handler => handler(...args)) // execute
//       })
//     },

//     invoke(type, callback) {
//       map(listeners, (handlers, key) => {
//         if (!new RegExp(`^${key.replace(/\*/g, '\\w+')}$`).test(type)) return
//         map(handlers, handler => callback(handler)) // execute
//       })
//     }
//   }
// }

// No Wildcard Support
// ================================================================

/**
 * @beta
 */
export type Handler = (...args: unknown[]) => unknown

export default () => {
  const listeners = Object.create(null)

  return {
    listeners,

    on(type: string, handler: Handler): void {
      listeners[type] = listeners[type] || []
      listeners[type].push(handler)
    },

    off(type: string, handler?: Handler): void {
      if (!handler) delete listeners[type]
      else remove(listeners[type], (value: Handler): boolean => value === handler)
    },

    emit(type: string, ...args: unknown[]): void {
      map(listeners[type], (handler: Handler) => handler(...args))
    },

    invoke(type: string, callback: (handler: Handler) => unknown): void {
      map(listeners[type], (handler: Handler) => callback(handler))
    },
  }
}

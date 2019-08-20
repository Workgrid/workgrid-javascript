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

interface Emitter {
  listeners: any
  on: Function
  off: Function
  emit: Function
  invoke: Function
}

export default (): Emitter => {
  const listeners = Object.create(null)

  return {
    listeners,

    on(type: string, handler: Function): void {
      listeners[type] = listeners[type] || []
      listeners[type].push(handler)
    },

    off(type: string, handler?: Function): void {
      if (!handler) delete listeners[type]
      else remove(listeners[type], (value: Function): boolean => value === handler)
    },

    emit(type: string, ...args: [any]): void {
      map(listeners[type], (handler: Function): any => handler(...args))
    },

    invoke(type: string, callback: Function): void {
      map(listeners[type], (handler: Function): any => callback(handler))
    }
  }
}

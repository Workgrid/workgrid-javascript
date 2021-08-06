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

import emitter from './emitter'

type Emitter = ReturnType<typeof emitter>

describe('emitter', () => {
  // let emitter
  let getHandlers: (emitter: Emitter) => Emitter['listeners']

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    // emitter = require('./emitter').default

    const { flatten, values } = require('lodash')
    getHandlers = (emitter) => flatten(values(emitter.listeners))
  })

  describe('on() / off()', () => {
    test('register and unregister handler', () => {
      const anEmitter = emitter()
      const handler = jest.fn()

      anEmitter.on('event', handler)
      expect(getHandlers(anEmitter)).toContain(handler)

      anEmitter.off('event', handler)
      expect(getHandlers(anEmitter)).not.toContain(handler)
    })

    test('unregister all handlers', () => {
      const anEmitter = emitter()

      anEmitter.on('event', jest.fn())
      anEmitter.on('event', jest.fn())

      anEmitter.off('event')
      expect(getHandlers(anEmitter)).toEqual([])
    })
  })

  describe('emit()', () => {
    test('invoke the handler with args', () => {
      const anEmitter = emitter()
      const handler = jest.fn()

      anEmitter.on('event', handler)
      anEmitter.emit('event', 'something')

      expect(handler).toHaveBeenCalledWith('something')
    })
  })

  describe('invoke()', () => {
    test('invoke the callback with handler', () => {
      const anEmitter = emitter()
      const handler = jest.fn()
      const callback = jest.fn()

      anEmitter.on('event', handler)
      anEmitter.invoke('event', callback)

      expect(callback).toHaveBeenCalledWith(handler)
    })
  })
})

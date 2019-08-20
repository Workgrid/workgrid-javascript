import emitter from './emitter'

describe('emitter', () => {
  // let emitter
  let getHandlers: Function

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    // emitter = require('./emitter').default

    const { flatten, values } = require('lodash')
    getHandlers = (emitter: any): any[] => flatten(values(emitter.listeners))
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

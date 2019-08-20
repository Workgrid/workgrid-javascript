import ms from 'ms'
import Courier from './courier'

const createSource = (courier: Courier): { postMessage: Function } => {
  const source = {
    postMessage: (data: any): void => {
      try {
        courier.handleMessage({ data, source })
      } catch (error) {
        // Swallow errors :)
      }
    }
  }

  courier.register(source)
  return source
}

describe('@workgrid/courier', () => {
  // let Courier: Courier
  // let ms: any

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    //   Courier = require('./courier').default
    //   ms = require('ms')
  })

  test('emitter is resolved by empty handler', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => {})
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual(undefined)
  })

  test('emitter is resolved by sync handler', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => 'world')
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual('world')
  })

  test('emitter is resolved by async handler', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.on('hello', async () => 'world')
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual('world')
  })

  test('emitter is rejected by sync handler', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => {
      throw 'world'
    })
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).rejects.toThrowErrorMatchingSnapshot()
  })

  test('emitter is rejected by async handler', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => Promise.reject('world'))
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).rejects.toThrowErrorMatchingSnapshot()
  })

  test('emitter is rejected by timeout', async () => {
    const courier = new Courier({ timeout: ms('1 second'), hosts: [] })
    const source = createSource(courier)

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingSnapshot()
  })

  test('target is not a member of sources', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    courier.unregister(source)

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingSnapshot()
  })

  test('target.postMessage or JSON.stringify throws', async () => {
    const courier = new Courier({ hosts: [] })
    const source = createSource(courier)

    source.postMessage = () => {
      throw new Error('')
    }

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingSnapshot()
  })

  test('error is emitted if a message is received from an unexpected source', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)
    courier.unregister(source)

    source.postMessage('Unexpected')
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingSnapshot()
  })

  test('error is emitted if data cannot be parsed', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)

    source.postMessage('{ invalid: json }')
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingSnapshot()
  })

  test('error is emitted if data does not have type or parentId', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)

    source.postMessage({ missing: 'props' })
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingSnapshot()
  })
})

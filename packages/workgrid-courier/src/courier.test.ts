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

import ms from 'ms'
import Courier from './courier'

const createSource = (courier: Courier) => {
  const source = {
    postMessage: (data: unknown, _targetOrigin: string, transfer?: Transferable[]): void => {
      if (transfer && transfer.length) {
        transfer.forEach((transferable) => {
          if ('postMessage' in transferable) {
            transferable.postMessage(data)
          }
        })
      } else {
        courier.handleMessage(
          new MessageEvent('message', {
            source: source as MessageEvent['source'],
            data,
          })
        )
      }
    },
  }

  courier.register(source)
  return source
}

// MessageChannel is not defined in jsdom, creating a super naive mock
class MessageChannel {
  port1 = {
    postMessage: (data) => {
      if (typeof this.port2.onmessage === 'function') {
        this.port2.onmessage(new MessageEvent('message', { data }))
      }
    },
  } as MessagePort
  port2 = {
    postMessage: (data) => {
      if (typeof this.port1.onmessage === 'function') {
        this.port1.onmessage(new MessageEvent('message', { data }))
      }
    },
  } as MessagePort
}

// Run the full suite of tests with and without MessagChannel
describe.each`
  MessageChannel
  ${true}
  ${false}
`('@workgrid/courier (MessageChannel: $MessageChannel)', ({ MessageChannel: useMessageChannel }) => {
  // let Courier: Courier
  // let ms: any

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    //   Courier = require('./courier').default
    //   ms = require('ms')

    if (useMessageChannel) globalThis.MessageChannel = MessageChannel
  })

  afterEach(() => {
    delete globalThis.MessageChannel
  })

  test('emitter is resolved by empty handler', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => {})
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual(undefined)
  })

  test('emitter is resolved by sync handler', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => 'world')
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual('world')
  })

  test('emitter is resolved by async handler', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.on('hello', async () => 'world')
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).resolves.toEqual('world')
  })

  test('emitter is rejected by sync handler', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => {
      throw 'world'
    })
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"APP-16"`)
  })

  test('emitter is rejected by async handler', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.on('hello', () => Promise.reject('world'))
    const promise = courier.send({ type: 'hello', target: source })

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"APP-16"`)
  })

  test('emitter is rejected by timeout', async () => {
    const courier = new Courier({ timeout: ms('1 second'), hosts: [] })
    const source = createSource(courier)

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"APP-14"`)
  })

  test('target is set as the event source (explicit)', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    const handler = jest.fn()
    courier.on('hello', handler)
    await courier.send({ type: 'hello', target: source })

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source }))
  })

  test('target is set as the event source (implicit: target defaults to first registered source)', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    const handler = jest.fn()
    courier.on('hello', handler)
    await courier.send({ type: 'hello' })

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ source }))
  })

  test('target is not a member of sources', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    courier.unregister(source)

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"APP-13"`)
  })

  test('target.postMessage or JSON.stringify throws', async () => {
    const courier = new Courier({ sources: [], hosts: [] })
    const source = createSource(courier)

    source.postMessage = () => {
      throw new Error('')
    }

    const promise = courier.send({ type: 'hello', target: source })
    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(`"APP-12"`)
  })

  test('error is emitted if a message is received from a null source', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ sources: [], hosts: [] })
    courier.on('error', errorHandler)

    courier.handleMessage(
      new MessageEvent('message', {
        source: null,
        data: 'Null Source',
      })
    )

    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingInlineSnapshot(`"APP-15"`)
  })

  test('error is emitted if a message is received from an unexpected source', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ sources: [], hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)
    courier.unregister(source)

    source.postMessage('Unexpected Source', '*')
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingInlineSnapshot(`"APP-15"`)
  })

  test('error is emitted if data cannot be parsed', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ sources: [], hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)

    source.postMessage('{ invalid: json }', '*')
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingInlineSnapshot(`"APP-11"`)
  })

  test('error is emitted if data does not have type or parentId', async () => {
    const errorHandler = jest.fn()
    const courier = new Courier({ sources: [], hosts: [] })
    courier.on('error', errorHandler)

    const source = createSource(courier)

    source.postMessage({ missing: 'props' }, '*')
    expect(errorHandler).toHaveBeenCalled()
    expect(() => {
      throw errorHandler.mock.calls[0][0]
    }).toThrowErrorMatchingInlineSnapshot(`"APP-10"`)
  })
})

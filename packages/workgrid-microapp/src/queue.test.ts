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

import queue from './queue'

describe('queue', () => {
  // let queue

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()

    // queue = require('./queue').default
  })

  describe('push()', () => {
    test('push to the queue if it has not been flushed', () => {
      const aQueue = queue()
      const fn = jest.fn()

      aQueue.push(fn)

      expect(aQueue.queue).toContain(fn)
      expect(fn).not.toHaveBeenCalled()
    })

    test('skip pushing to the queue and execute immediately if it has been flushed', () => {
      const aQueue = queue()
      const fn = jest.fn()

      aQueue.flush()
      aQueue.push(fn)

      expect(aQueue.queue).not.toContain(fn)
      expect(fn).toHaveBeenCalled()
    })
  })

  describe('flush()', () => {
    test('will execute all queue items and mark the queue as flushed', () => {
      const aQueue = queue()
      const fn = jest.fn()

      aQueue.push(fn)
      expect(aQueue.queue).toContain(fn)

      aQueue.flush()
      expect(fn).toHaveBeenCalled()
      expect(aQueue.queue.flushed).toBe(true)
    })
  })
})

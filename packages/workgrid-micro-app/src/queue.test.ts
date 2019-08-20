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

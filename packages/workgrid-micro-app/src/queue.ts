interface QueueArray<T> extends Array<T> {
  flushed?: boolean
}

interface Queue {
  queue: QueueArray<Function>
  push: Function
  flush: Function
}

export default (): Queue => {
  const queue: QueueArray<Function> = []

  return {
    queue,

    push(fn: Function): void {
      if (queue.flushed) fn()
      else queue.push(fn)
    },
    flush(): void {
      queue.flushed = true
      queue.map((fn: Function): void => fn())
    }
  }
}

interface QueueArray<T> extends Array<T> {
  flushed?: boolean
}

export default () => {
  const queue: QueueArray<() => void> = []

  return {
    queue,

    push(fn: () => void) {
      if (queue.flushed) fn()
      else queue.push(fn)
    },
    flush() {
      queue.flushed = true
      queue.map((fn) => fn())
    },
  }
}

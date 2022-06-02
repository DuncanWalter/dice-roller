type FunctionSubset<T> = T extends (...args: any[]) => any ? T : never

export function isFunction<T>(f: T): f is FunctionSubset<T> {
  return f && typeof f == 'function'
}

function noop(): never {
  throw new Error('semaphore decrement was called unexpectedly')
}

export function semaphore(fun: () => () => undefined): () => () => undefined {
  let semaphoreValue = 0
  let callback: () => undefined = noop
  return () => {
    if (!semaphoreValue++) {
      callback = fun()
    }
    return (): undefined => {
      if (!--semaphoreValue) {
        callback()
        callback = noop
      }
      return
    }
  }
}

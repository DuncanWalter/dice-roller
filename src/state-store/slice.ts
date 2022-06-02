type Peek = <T>(slice: Slice<T>) => T
type Evaluate<V> = (peek: Peek, self: Slice) => V

class Slice<V = any> {
  children: Set<null | Slice>
  evaluate: Evaluate<V>
  dependencies: Set<Slice>
  value: V

  constructor(evaluate: Evaluate<V>) {
    this.evaluate = evaluate
    this.children = new Set()
    this.dependencies = new Set()
    this.value = undefined as any
  }

  evaluating = false
  update(peek: Peek): V {
    if (this.evaluating) {
      throw new Error('cyclic graph detected')
    }
    const staleDependencies = new Set(this.dependencies)
    this.evaluating = true
    let result
    try {
      result = this.evaluate(<T>(dep: Slice<T>) => {
        if (!this.evaluating) throw new Error('async peeks not allowed')
        staleDependencies.delete(dep)
        this.dependencies.add(dep)
        if (this.children.size) {
          dep.subscribe(this, peek)
        }
        return peek(dep)
      }, this)

      // remove any unused dependencies and subscriptions
      for (const staleDependency of staleDependencies) {
        this.dependencies.delete(staleDependency)
        if (this.children.size) {
          staleDependency.unsubscribe(this)
        }
      }
    } finally {
      this.evaluating = false
    }

    return result
  }

  subscribe(newChild: Slice | null, peek: Peek): undefined {
    if (this.children.has(newChild)) return
    const willUpdate = !this.children.size
    this.children.add(newChild)
    if (willUpdate) {
      try {
        this.value = this.update(peek)
      } catch (err) {
        this.unsubscribe(newChild)
        throw err
      }
    }
  }

  unsubscribe(subscriber: Slice | null): undefined {
    if (this.children.delete(subscriber) && !this.children.size) {
      this.dependencies.forEach((dependency) => dependency.unsubscribe(this))
    }
    return
  }
}

class StateSlice<V = any> extends Slice<V> {
  state: V
  constructor(initialValue: V) {
    super(() => this.state)
    this.state = initialValue
  }
}

class CallbackSlice extends Slice<undefined> {
  constructor(callback: Evaluate<undefined>) {
    super(callback)
  }
  activate(peek: Peek) {
    return this.subscribe(null, peek)
  }
  deactivate() {
    return this.unsubscribe(null)
  }
}

export type { Slice, StateSlice, CallbackSlice, Peek as PeekSlice }

export function createSlice<V>(evaluate: Evaluate<V>): Slice<V> {
  return new Slice(evaluate)
}
export function createStateSlice<V>(initialValue: V): StateSlice<V> {
  return new StateSlice(initialValue)
}
export function createCallbackSlice(
  callback: (_peek: Peek) => undefined,
): CallbackSlice {
  return new CallbackSlice(callback)
}

export function isSlice<T>(query: T): query is T extends Slice ? T : never {
  return query && query instanceof Slice
}
export function isStateSlice<T>(
  query: T,
): query is T extends StateSlice ? T : never {
  return query && query instanceof StateSlice
}
export function isCallbackSlice(query: unknown): query is CallbackSlice {
  return !!query && query instanceof CallbackSlice
}

interface PropagationContext {
  enqueued: Set<Slice>
  evaluated: Set<Slice>
  valueQueue: Slice[]
  callbackQueue: CallbackSlice[]
  handleError: (err: Error) => undefined
}

function contributeToPropagation(
  slices: Iterable<Slice | null>,
  propagationContext: PropagationContext,
) {
  for (const slice of slices) {
    if (slice && !propagationContext.enqueued.has(slice)) {
      propagationContext.enqueued.add(slice)
      if (isCallbackSlice(slice)) {
        propagationContext.callbackQueue.push(slice)
      } else {
        propagationContext.valueQueue.push(slice)
      }
    }
  }
}

let running = false
function propagateInternal(ctx: PropagationContext) {
  if (running) throw new Error('propagation already running')
  running = true
  function peek<T>(slice: Slice<T>) {
    if (ctx.evaluated.has(slice)) {
      return slice.value
    } else {
      let newValue: T
      try {
        const lastValue = slice.value
        newValue = slice.update(peek)
        if (newValue !== lastValue) {
          slice.value = newValue
          contributeToPropagation(slice.children.values(), ctx)
        }
      } finally {
        ctx.evaluated.add(slice)
      }
      return newValue
    }
  }

  while (ctx.valueQueue.length + ctx.callbackQueue.length) {
    try {
      while (ctx.valueQueue.length) {
        peek(ctx.valueQueue.pop()!)
      }
      while (ctx.callbackQueue.length) {
        peek(ctx.callbackQueue.pop()!)
      }
    } catch (err) {
      ctx.handleError(err as Error)
    }
  }
  running = false
}

export function propagate(
  slices: Map<Slice | null, any>[],
  handleError: (err: Error) => undefined,
) {
  const propagationContext: PropagationContext = {
    enqueued: new Set(),
    evaluated: new Set(),
    valueQueue: [],
    callbackQueue: [],
    handleError,
  }
  for (let i = 0; i < slices.length; i++) {
    contributeToPropagation(slices[i].keys(), propagationContext)
  }
  propagateInternal(propagationContext)
}

export function extractValue<V>(slice: Slice<V>, marks: Map<Slice, any>): V {
  if (slice.children.size) return slice.value
  if (marks.has(slice)) return marks.get(slice)
  const result = slice.update((dep) => extractValue(dep, marks))
  marks.set(slice, result)
  return result
}

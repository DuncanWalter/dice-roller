import {
  Slice,
  createSlice,
  isSlice,
  StateSlice,
  createStateSlice,
  isStateSlice,
  createCallbackSlice,
  PeekSlice,
  propagate,
  extractValue,
} from './slice'
import {
  Store,
  Dispatch,
  Dispatchable,
  Middleware,
  RawDispatch,
  MiddlewareAPI,
  RawStore,
  Assignment,
  AssignmentList,
  State,
  Peek,
} from './types'
import { Atom, isAtom, isSelector, Effect } from './atom'
import { isFunction, semaphore } from './utils'

export function createPropagate(handleError: (err: Error) => undefined) {
  let tasks: Map<Slice, any>[] = []
  let queue = Promise.resolve(undefined)
  return function _propagate(slices: Map<Slice, any>) {
    const willEnqueue = !tasks.length
    tasks.push(slices)
    if (willEnqueue) {
      queue = queue.then((): undefined => {
        const enqueued = tasks
        tasks = []
        propagate(enqueued, handleError)
        return
      }, handleError)
    }
    return queue
  }
}

function createRawDispatch(store: RawStore) {
  return function internalDispatch(assignments: Dispatchable) {
    const marks = new Map<Slice, any>()
    const stack = [assignments]
    while (stack.length) {
      const assignment = stack.pop()!
      if (Array.isArray(assignment)) {
        stack.push.apply(stack, assignment)
      } else if (assignment && assignment !== true) {
        const slice = store.wrap(assignment.atom)
        if (!isStateSlice(slice)) throw new Error('huh?')
        const lastState = slice.state
        if (assignment.updateValue) {
          try {
            slice.state = assignment.updateValue(lastState)
          } catch (err) {
            store.handleError(err as Error)
          }
        } else {
          slice.state = assignment.value
        }
        if (lastState !== slice.state) {
          marks.set(slice, slice.state)
        }
      }
    }
    return store.propagate(marks)
  }
}

function createDispatch(store: Store, rawDispatch: RawDispatch) {
  return function dispatch(
    actionable:
      | Assignment
      | AssignmentList
      | ((dispatch: Dispatch, peek: Peek) => any),
  ): unknown {
    if (isFunction(actionable)) {
      const cache = new Map()
      return actionable(dispatch as any, (state) => store.peek(state, cache))
    } else {
      return rawDispatch(actionable)
    }
  } as Dispatch
}

function createPeek(store: RawStore) {
  return function peek<V>(wrapper: State<V>, marks?: Map<Slice, any>) {
    return extractValue(store.wrap(wrapper), marks || new Map())
  }
}

function createWrap(store: RawStore) {
  function wrap<V>(atom: Atom<V>): StateSlice<V>
  function wrap<V>(atom: State<V>): Slice<V>
  function wrap<V>(atom: State<V>): Slice<V> {
    if (isSlice(atom)) {
      return atom
    }

    const existingSlice = store.slices.get(atom)

    if (existingSlice) {
      return existingSlice
    } else if (isSelector(atom)) {
      const slice = createSlice((peek) =>
        atom.select((state) => peek(store.wrap(state)), store.dispatch),
      )
      store.slices.set(atom, slice)
      return slice
    } else if (isAtom(atom)) {
      const slice = createStateSlice(atom.defaultValue)
      store.slices.set(atom, slice)
      return slice
    } else {
      console.log(atom)
      throw new Error('unrecognized state specifier')
    }
  }

  return wrap
}

function createSubscribe(store: RawStore) {
  const semaphores = new WeakMap<Effect, () => () => undefined>()
  return function subscribe(effect: Effect): () => undefined {
    const rawEffect = isSelector(effect) ? effect.select : effect
    let lock = semaphores.get(rawEffect)
    if (!lock) {
      let activity = Promise.resolve<unknown>(undefined)
      const slice = createCallbackSlice(
        (peek: PeekSlice): undefined => {
          const result = rawEffect(
            (state) => peek(store.wrap(state)),
            store.dispatch,
          )
          if (result && result instanceof Promise) {
            const caughtResult = result.catch(store.handleError)
            activity = activity.then(() => caughtResult)
          }
          return
        },
      )
      lock = semaphore(() => {
        slice.activate(store.peek)
        return () => void activity.finally(() => slice.deactivate())
      })
      semaphores.set(rawEffect, lock)
    }
    return lock()
  }
}

function defaultErrorHandler(err: Error): undefined {
  if (err && err instanceof Error) {
    console.error(err)
  } else {
    console.error(new Error(`Unexpected non-error value ${err}`))
  }
  return
}

export function createStore({
  handleError = defaultErrorHandler,
  middlewares = [],
}: {
  handleError?: (err: Error) => undefined
  middlewares?: Middleware[]
}): Store {
  const store = {
    slices: new WeakMap(),
  } as RawStore
  const middlewareApi: MiddlewareAPI = {
    wrap: createWrap(store),
    peek: createPeek(store),
    subscribe: createSubscribe(store),
    dispatch: createRawDispatch(store),
    propagate: createPropagate(handleError),
    handleError,
  }
  Object.assign(store, middlewareApi)

  const { dispatch, ...storeAPI } = middlewares.reduceRight<MiddlewareAPI>(
    (acc, middleware) => Object.assign(acc, middleware(store)),
    store,
  )

  Object.assign(store, storeAPI)
  store.dispatch = createDispatch(store, dispatch)

  return store
}

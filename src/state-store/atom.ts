import { Assignment, Peek, Dispatch } from './types'

export type AnyState =
  | number
  | boolean
  | string
  | null
  | AnyState[]
  | { [key: string]: AnyState }
  | Atom

function _deepCloneState<U extends AnyState>(
  node: U,
  peek: Peek,
  visited: Map<AnyState, AnyState>,
): U {
  if (!node || typeof node !== 'object') return node
  const cached = visited.get(node)
  if (cached !== undefined) return cached as U
  if (node instanceof Atom) {
    if (node.id !== undefined) {
      throw new Error("named atoms shouldn't be cloned")
    }
    const result = createAtom('[[deep-clone-initial-state]]')
    visited.set(node, result)
    result.defaultValue = _deepCloneState(peek(node), peek, visited)
    return result as any
  }
  if (Array.isArray(node)) {
    const result: AnyState[] = []
    visited.set(node, result)
    for (let i = 0; i < node.length; i++) {
      result[i] = _deepCloneState(node[i], peek, visited)
    }
    return result as any
  }
  const result: any = {}
  visited.set(node, result)
  for (const key of Object.keys(node)) {
    result[key] = _deepCloneState(node[key], peek, visited)
  }
  return result
}

export function deepCloneState<T extends AnyState>(state: T, peek: Peek): T {
  return _deepCloneState(state, peek, new Map<AnyState, AnyState>())
}
class Atom<State = any> {
  id?: string
  defaultValue: State
  __internal?: {
    invariant: (state: State) => State
  }
  constructor(
    id: undefined | string,
    initialValue: State /*actions?: Actions*/,
  ) {
    this.id = id || undefined
    this.defaultValue = initialValue
  }

  set(value: State): Assignment {
    return { atom: this, value }
  }

  update(updateValue: (lastState: State) => State): Assignment {
    return { atom: this, updateValue }
  }
}

export function isAtom<T>(
  maybeAtom: T,
): maybeAtom is T extends Atom<any> ? T : never {
  return !!(maybeAtom && maybeAtom instanceof Atom)
}

export function createAtom<State extends AnyState>(
  initialValue: State,
): Atom<State> {
  return new Atom(undefined, initialValue)
}

export function createNamedAtom<State extends AnyState>(
  id: string,
  initialValue: State,
): Atom<State> {
  return new Atom(id, initialValue)
}

export type { Atom }

type Select<Value> = (peek: Peek, dispatch: Dispatch) => Value
type Effect =
  | Select<undefined | Promise<undefined>>
  | Selector<undefined | Promise<undefined>>

class Selector<Value> {
  select: Select<Value>

  constructor(select: Select<Value>) {
    this.select = select
  }
}

export function isSelector<T>(
  maybeSelector: T,
): maybeSelector is T extends Selector<any> ? T : never {
  return !!(maybeSelector && maybeSelector instanceof Selector)
}

const selectors = new WeakMap<Select<any>, Selector<any>>()
export function createSelector<Value>(select: Select<Value>): Selector<Value> {
  let selector = selectors.get(select)
  if (!selector) {
    selector = new Selector(select)
    selectors.set(select, selector)
  }
  return selector
}

export type { Select, Selector, Effect }

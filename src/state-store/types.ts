import { Slice, StateSlice } from './slice'
import { Atom, Effect, Selector } from './atom'

type Maybe<T> = T | null | undefined | boolean

export type State<T> = Atom<T> | Selector<T> | Slice<T>

/**
 * TODO: doc
 */
export interface Peek {
  <V>(wrapper: State<V>, marks?: Map<Slice, any>): V
}

export type Dispatchable = Maybe<Assignment | AssignmentList>

export interface RawDispatch {
  (action: Dispatchable): Promise<undefined>
}

/**
 * TODO: doc
 */
export interface Dispatch extends RawDispatch {
  <Result>(thunk: (dispatch: Dispatch, peek: Peek) => Result): Result
}

export interface RawWrap {
  <S>(state: State<S>): Slice<S> | StateSlice<S>
}

/**
 * TODO: doc
 */
export interface Wrap {
  <S>(state: State<S>): Slice<S>
}

/**
 * TODO: doc
 */
export interface Subscribe {
  (effect: Effect): () => undefined
}

export type Assignment<S = any> =
  | {
      atom: Atom<S>
      value: S
      updateValue?: undefined
    }
  | {
      atom: Atom<S>
      value?: undefined
      updateValue: (last: S) => S
    }

export type AssignmentList = Array<Maybe<AssignmentList | Assignment>>

/**
 * TODO: doc
 */
export interface Store {
  dispatch: Dispatch
  peek: Peek
  wrap: Wrap
  subscribe: Subscribe
  handleError: (err: Error) => undefined
}

export interface MiddlewareAPI {
  dispatch: RawDispatch
  peek: Peek
  wrap: RawWrap
  subscribe: Subscribe
  handleError: (err: Error) => undefined
  propagate: (slices: Map<Slice, any>) => Promise<undefined>
}

/**
 * TODO: doc
 */
export type Middleware = (store: RawStore) => Partial<MiddlewareAPI>

export interface RawStore extends Store, MiddlewareAPI {
  dispatch: Dispatch
  peek: Peek
  wrap: RawWrap
  slices: WeakMap<Atom<any> | Selector<any>, Slice<any>>
  handleError: (err: Error) => undefined
}

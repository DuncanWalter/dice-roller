import { createSlice, createStateSlice, isSlice, isStateSlice } from './slice'
import { isFunction, semaphore } from './utils'

export const utils = {
  createSlice,
  createStateSlice,
  isSlice,
  isStateSlice,
  isFunction,
  semaphore,
}

export {
  createAtom,
  createNamedAtom,
  isAtom,
  createSelector,
  isSelector,
} from './atom'
export type { Atom, Selector, Effect, Select } from './atom'

export { createStore } from './createStore'
export * from './types'

export type { Slice } from './slice'

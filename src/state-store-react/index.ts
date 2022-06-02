export { StoreProvider } from './Provider'
export { useDispatch } from './useStore'
export { createAtomWithReducer } from './reducer-stuff'

export * from './useSelector'

import { utils as storeUtils, createStore } from '../state-store'
import { useStore } from './useStore'
import { StoreContext } from './Provider'

export const utils = {
  ...storeUtils,
  useStore,
  StoreContext,
  createStore,
}

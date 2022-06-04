import React, { ReactChild, useMemo } from 'react'

import { createStore, Store } from '../state-store'

function _throw(err: Error): never {
  throw err
}

function contextError(): any {
  throw new Error(
    'StoreContext referenced from outside the context of a store provider',
  )
}

export const StoreContext = React.createContext<Store>({
  wrap: contextError,
  dispatch: contextError,
  peek: contextError,
  subscribe: contextError,
  handleError: contextError,
})

export interface ProviderProps {
  children: ReactChild
  configureStore?: (storeFactory: typeof createStore) => Store
}

export function StoreProvider({
  children,
  configureStore = (storeFactory) =>
    storeFactory({
      handleError(err) {
        return void setTimeout(_throw, 0, err)
      },
    }),
}: ProviderProps) {
  const store = useMemo(() => configureStore(createStore), [configureStore])
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

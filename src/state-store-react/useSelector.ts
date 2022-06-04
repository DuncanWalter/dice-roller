/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useState, useEffect, useMemo, useRef } from 'react'

import { State, Peek, createSelector, Effect } from '../state-store'
import { createCallbackSlice } from '../state-store/slice'
import { StoreContext } from './Provider'
import { empty, emptyDeps } from './utils'

function useChanged(newValue: unknown): boolean {
  const ref = useRef(empty as unknown)
  const lastValue = ref.current
  ref.current = newValue
  return lastValue !== newValue
}

function useFastMemo<T>(value: T | empty): T {
  const ref = useRef(value)
  if (value !== empty) {
    ref.current = value
  }
  if (ref.current === empty) {
    throw new Error('bad state')
  }
  return ref.current
}

export function useStoreValue<T>(storeValue: State<T>): T {
  const store = useContext(StoreContext)
  const changed = useChanged(storeValue)

  const slice = store.wrap(storeValue)
  const peekedValue = store.peek(slice)
  const [, setValue] = useState(peekedValue)
  const effect = useFastMemo(
    changed
      ? () => {
          const cbSlice = createCallbackSlice(
            (peek) => void setValue(peek(slice)),
          )
          cbSlice.activate(store.peek)
          return () => cbSlice.deactivate()
        }
      : empty,
  )
  useEffect(effect, [storeValue])

  return peekedValue
}

export function usePeek<T>(select: (peek: Peek) => T, deps: unknown[]): T {
  return useStoreValue(useMemo(() => createSelector(select), deps))
}

export function useSubscribe(sideEffect: Effect, deps: unknown[] = emptyDeps) {
  const { subscribe } = useContext(StoreContext)
  const effect = useMemo(() => () => subscribe(sideEffect), deps)
  useEffect(effect, deps)
}

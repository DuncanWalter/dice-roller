import { useContext } from 'react'
import { StoreContext } from './Provider'

export function useStore() {
  return useContext(StoreContext)
}

export function useDispatch() {
  return useContext(StoreContext).dispatch
}

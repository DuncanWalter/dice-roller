import { Assignment, Atom } from '../state-store'
import { AnyState, createNamedAtom } from '../state-store/atom'

type ReducerHandlers<State> = Record<
  string,
  (state: State, ...args: any[]) => State
>

type ActionsFromHandlers<State, Handlers> =
  Handlers extends ReducerHandlers<State>
    ? {
        [K in keyof Handlers]: Handlers[K] extends (
          state: State,
          ...args: infer Args
        ) => State
          ? (...args: Args) => Assignment
          : never
      }
    : never

export function createAtomWithReducer<
  T extends AnyState,
  Handlers extends ReducerHandlers<T>,
>(
  id: string,
  reducerHandlers: Handlers,
  initialValue: T,
): Atom<T> & ActionsFromHandlers<T, Handlers> {
  const atom = createNamedAtom(id, initialValue)
  for (const key of Object.keys(reducerHandlers)) {
    if (key === 'update' || key === 'set') {
      // TODO
      throw new Error('Atom update and set methods should not be overwritten')
    }

    ;(atom as any)[key] = (...args: any[]) =>
      atom.update((state: any) => reducerHandlers[key](state, ...args))
  }
  return atom as Atom<T> & ActionsFromHandlers<T, Handlers>
}

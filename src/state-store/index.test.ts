import { createAtom, createStore, Slice } from '.'
import { createNamedAtom } from './atom'
import { createPersistMiddleware } from '../dev-middleware'
import {
  createCallbackSlice,
  createSlice,
  extractValue,
  propagate,
} from './slice'

let queue = Promise.resolve(undefined)

function test(
  label: string,
  fn: (
    resolve: (v?: undefined | true | null) => void,
    reject: (err: Error) => void,
  ) => unknown,
) {
  const callback = async () => {
    try {
      await new Promise((resolve, reject) =>
        Promise.resolve(fn(resolve, reject)).then(resolve, reject),
      )
      console.log(`Passed ${label}`)
    } catch (err) {
      console.error(`Failed ${label}`)
      console.error(err)
    }
    return undefined
  }
  queue = queue.then(callback, callback)
}

function shuffle(arr: Array<unknown>) {
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i]
    const rand = Math.floor(arr.length * Math.random())
    arr[i] = arr[rand]
    arr[rand] = val
  }
}

test('cyclicStateGraph', (resolve, reject) => {
  const root = createSlice(() => [1])
  const left: Slice<number[]> = createSlice<number[]>((peek) => [
    ...peek(root),
    ...peek(right),
  ])
  const right: Slice<number[]> = createSlice<number[]>((peek) => [
    ...peek(root),
    ...peek(left),
  ])
  const sink = createSlice((peek) => [...peek(left), ...peek(right)])

  try {
    const sub = createCallbackSlice(() => {
      reject(new Error('got a value that should never have returned'))
      return undefined
    })
    sink.subscribe(
      sub,
      (
        (marks: Set<Slice>) =>
        <T>(slice: Slice<T>) =>
          extractValue(slice, marks)
      )(new Set()),
    )
    propagate([new Set([root])], reject as any)
    sink.unsubscribe(sub)
  } catch (err) {
    // swallow- we expect this to fail
  }

  try {
    extractValue(sink, new Set())
    reject(new Error('got a value that should never have returned'))
  } catch (err) {
    resolve()
  }
})

test('pathologicalPropagationOrdering', (__resolve, reject) => {
  // const { propagate } = createNetwork((err) => void reject(err))

  const primer = createSlice(() => ({ value: 0 }))
  const n = 25
  const slices = new Array(n).fill(null).map(() =>
    createSlice((peek, self): { value: number } => {
      const previous = slices[slices.indexOf(self) - 1]
      const value: number = peek(previous || primer).value
      if (value !== slices.indexOf(self)) {
        throw new Error('technically unstable')
      }
      return { value: value + 1 }
    }),
  )
  const sink = createSlice((peek) => {
    const { value } = peek(slices[slices.length - 1])
    if (value !== n) {
      throw new Error(`${value}`)
    }
    return { value }
  })
  const sub = createCallbackSlice((peek) => {
    const { value } = peek(sink)
    if (value !== n) {
      throw new Error(`${value}`)
    }
    return undefined
  })
  sub.activate(
    (
      (marks: Set<Slice>) =>
      <T>(slice: Slice<T>) =>
        extractValue(slice, marks)
    )(new Set()),
  )

  shuffle(slices)
  propagate([new Set([primer])], reject as any)

  sink.unsubscribe(sub)

  shuffle(slices)
  extractValue(sink, new Set())
})

test('PersistMiddleware', () => {
  const recordedState = new Map<string, string>()
  function persistedStore() {
    return createStore({
      middlewares: [
        createPersistMiddleware({
          record(key, str) {
            recordedState.set(key, str)
            return undefined
          },
          retrieve(key) {
            return recordedState.get(key)
          },
        }),
      ],
    })
  }

  let store = persistedStore()

  const left = createAtom([] as number[])
  const right = createAtom([] as number[])
  let red = createNamedAtom('red', [left, right])
  let blue = createNamedAtom('blue', [left, right, red])

  store.dispatch([
    { atom: red, updateValue: (arr) => [...arr] },
    { atom: blue, updateValue: (arr) => [...arr] },
    { atom: left, value: [1] },
    { atom: right, value: [2] },
  ])

  store = persistedStore()
  red = createNamedAtom('red', [left, right])
  blue = createNamedAtom('blue', [left, right, red])

  const [r0, r1] = store.peek(red)
  const [b0, b1, b2] = store.peek(blue)

  if (r0 === b0 && r1 === b1 && b2 === red) {
    // this is fine
  } else if (store.peek(r0)[0] && store.peek(r1)[0]) {
    // this is fine
  } else if (r0 !== left && r1 !== right) {
    // this is fine
  } else {
    throw new Error('something went wrong')
  }
})

export {}

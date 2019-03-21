import { useState } from 'react'

let hash = -(2 ** 53) + 1
export function useIsFirstRender() {
  return useState(++hash)[0] === hash
}

export const noop: never = (() => {
  throw new Error('NOOP was called unexpectedly')
}) as never

import React, {
  memo,
  ReactNode,
  Fragment,
  ReactFragment,
  ReactPortal,
  ReactChild,
  ReactElement,
} from 'react'

function childMatches(
  a: ReactChild | ReactFragment | ReactPortal,
  b: ReactChild | ReactFragment | ReactPortal,
) {
  if (a === b) {
    return true
  }

  if (
    typeof a !== 'object' ||
    a === null ||
    !(a as ReactElement).type ||
    typeof b !== 'object' ||
    b === null ||
    (a as ReactElement).type !== (b as ReactElement).type
  ) {
    return false
  }

  return propsMatch((a as ReactElement).props, (b as ReactElement).props)
}

function childrenMatch(a: ReactNode | ReactNode[], b: ReactNode | ReactNode[]) {
  const aArr = React.Children.toArray(a)
  const bArr = React.Children.toArray(b)

  if (aArr.length !== bArr.length) {
    return false
  }

  for (let i = 0; i < aArr.length; i++) {
    if (!childMatches(aArr[i], bArr[i])) {
      return false
    }
  }

  return true
}

function propsMatch(a: Record<string, any>, b: Record<string, any>) {
  if (a === b) {
    return true
  }

  if (!childrenMatch(a.children, b.children)) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i]
    if (currentKey !== 'children' && a[currentKey] !== b[currentKey]) {
      return false
    }
  }

  return true
}

/**
 * Declarative way to use React.memo
 */
export const Memo = memo(
  ({ children }: { children: ReactNode | ReactNode[] }) => (
    <Fragment>{children}</Fragment>
  ),
  (a, b) => propsMatch(a, b),
)

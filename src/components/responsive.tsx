import React, {
  ReactNode,
  useRef,
  useEffect,
  useState,
  memo,
  Fragment,
  Children,
  ReactElement,
} from 'react'
import { noop, useIsFirstRender } from './utils'

type ResponsiveContent = ReactNode | ((width: number) => ReactNode)
type ResponsiveCase = ReactElement<{
  minWidth: number
  content: ResponsiveContent
}>

interface ResponsiveProps {
  initialWidth?: number
  children: ResponsiveCase | ResponsiveCase[]
}

export function Responsive({ children, initialWidth = 0 }: ResponsiveProps) {
  const container = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(initialWidth)
  const isFirstRender = useIsFirstRender()

  useEffect(
    isFirstRender
      ? () => {
          let request = NaN

          function checkSize() {
            request = requestAnimationFrame(() => {
              if (!container.current) {
                checkSize()
                return
              }

              const reportedWidth = container.current.clientWidth // / (devicePixelRatio || 1.2)

              if (reportedWidth !== width) {
                setWidth(reportedWidth)
              }

              checkSize()
            })
          }

          checkSize()

          return () => {
            cancelAnimationFrame(request)
          }
        }
      : noop,
    [],
  )

  let child: ResponsiveCase | undefined
  if (container.current) {
    child = Children.toArray(children)
      .sort((a, b) => a.props.minWidth - b.props.minWidth)
      .reverse()
      .find(a => a.props.minWidth <= width)
  }

  if (!child) return <div ref={container} />

  if (typeof child.props.content === 'function') {
    return (
      <div ref={container}>
        <MemoContent child={child.props.content(width)} />
      </div>
    )
  }

  return (
    <div ref={container}>
      <MemoContent child={child.props.content} />
    </div>
  )
}

export function Case(props: { minWidth: number; content: ResponsiveContent }) {
  return <Fragment />
}

const MemoContent = memo(({ child }: { child: ReactNode }) => (
  <Fragment>{child}</Fragment>
))

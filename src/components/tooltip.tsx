import React, { ReactNode, useState } from 'react'
import { useRef } from 'react'
import { style } from 'typestyle'
import { useTheme } from './theme'
import { joinNames, justifyEnd, column, alignEnd } from './styles'
import { Text } from './text'
import { PanelContent, Panel } from './panel'

export interface TooltipTheme {
  tooltip: string
  container: string
  active: string
  left: string
  right: string
}

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  disabled?: boolean
  manual?: boolean
  size?: number
}

export function Tooltip({
  disabled,
  content,
  children,
  size = 240,
  manual = false,
}: TooltipProps) {
  const { tooltip: theme } = useTheme()
  const [active, setActive] = useState(false)
  const container = useRef(null as null | HTMLDivElement)

  let side
  let height
  if (container.current && window) {
    const { left, right, top } = container.current.getBoundingClientRect()
    if (window.innerWidth - right <= size && !(left < size)) {
      side = theme.left
    } else {
      side = theme.right
    }
    height = window.innerHeight - top
  } else {
    side = theme.right
    height = 0
  }

  return (
    <div
      className={theme.container}
      ref={container}
      onMouseEnter={() => setActive(manual ? active : true)}
      onMouseLeave={() => setActive(manual ? active : false)}
      onClick={
        manual && !disabled ? () => setActive(newActive => !newActive) : noop
      }
    >
      <div
        className={joinNames(
          theme.tooltip,
          active && !disabled && theme.active,
          side,
        )}
        style={{ width: `${size}px`, height: `${height}px` }}
      >
        <div
          className={joinNames(column, justifyEnd)}
          style={{ maxWidth: `${size}px` }}
        >
          {extractContent(content)}
          <div style={{ flex: 1 }} />
        </div>
      </div>
      {children}
    </div>
  )
}

function extractContent(node: ReactNode) {
  if (node && typeof node === 'string') {
    return (
      <Panel flush>
        <PanelContent>
          <Text body>{node}</Text>
        </PanelContent>
      </Panel>
    )
  } else {
    return node
  }
}

export const defaultTooltipTheme = {} as TooltipTheme

defaultTooltipTheme.container = style({
  position: 'relative',
  cursor: 'help',
})

defaultTooltipTheme.active = style({})

defaultTooltipTheme.tooltip = style({
  display: 'none',
  position: 'absolute',
  cursor: 'help',
  top: 0,
  $nest: {
    [`.${defaultTooltipTheme.container} > &.${defaultTooltipTheme.active}`]: {
      display: 'flex !important',
    },
  },
})

defaultTooltipTheme.left = style({
  right: '100%',
  justifyContent: 'end',
})

defaultTooltipTheme.right = style({
  left: '100%',
  justifyContent: 'start',
})

function noop() {}

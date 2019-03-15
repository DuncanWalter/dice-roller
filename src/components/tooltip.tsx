import React, { ReactNode, useState } from 'react'
import { useRef } from 'react'
import { style } from 'typestyle'
import { useTheme } from './theme'
import { joinNames, justifyEnd, column } from './styles'
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
  const tooltip = useRef(null as null | HTMLDivElement)

  let side
  if (container.current && window) {
    const { left, right } = container.current.getBoundingClientRect()
    if (window.innerWidth - right <= size && !(left < size)) {
      side = theme.left
    } else {
      side = theme.right
    }
  } else {
    side = theme.right
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
        ref={tooltip}
        style={{ width: `${size}px` }}
      >
        <div
          className={joinNames(column, justifyEnd)}
          style={{ maxWidth: `${size}px` }}
        >
          {extractText(content)}
        </div>
      </div>
      {children}
    </div>
  )
}

function extractText(node: ReactNode) {
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
  $nest: {
    [`.${defaultTooltipTheme.container} > &.${defaultTooltipTheme.active}`]: {
      display: 'flex !important',
    },
  },
})

defaultTooltipTheme.left = style({
  right: '100%',
  justifyContent: 'end',
  top: 0,
})

defaultTooltipTheme.right = style({
  left: '100%',
  justifyContent: 'start',
  top: 0,
})

function noop() {}

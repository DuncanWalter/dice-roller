import * as React from 'react'
import { ReactNode } from 'react'
import { style } from 'typestyle'
import { joinNames, justifyBetween, ClassName, alignStart } from './styles'
import { Text } from './text'
import { useTheme } from './theme'

export interface PanelTheme {
  content: string
  divider: string
  flush: string
  header: string
  panel: string
}

interface PanelProps {
  className?: ClassName
  children: ReactNode
  flush?: boolean
}

interface PanelHeaderProps {
  className?: ClassName
  text: string
  children?: ReactNode
}

interface PanelContentProps {
  className?: ClassName
  children: ReactNode
  flush?: boolean
}

export function Panel(props: PanelProps) {
  const { children, className } = props
  const { panel: theme } = useTheme()
  return (
    <div
      className={joinNames(className, theme.panel, props.flush && theme.flush)}
    >
      {children}
    </div>
  )
}

export function PanelHeader({ text, children, className }: PanelHeaderProps) {
  const { panel: theme } = useTheme()
  return (
    <div
      className={joinNames(className, justifyBetween, alignStart, theme.header)}
    >
      <Text title>{text}</Text>
      {children ? <div>{children}</div> : null}
    </div>
  )
}

export function PanelContent(props: PanelContentProps) {
  const { children, className } = props
  const { panel: theme } = useTheme()
  return (
    <div
      className={joinNames(
        className,
        theme.content,
        props.flush && theme.flush,
      )}
    >
      {children}
    </div>
  )
}

export function PanelDivider({ flush }: { flush?: boolean }) {
  const { panel: theme } = useTheme()
  return <hr className={joinNames(divider, flush && theme.flush)} />
}

const panel = style({
  borderRadius: 4,
  display: 'inline-block',
  padding: '8px',
  margin: '8px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px 1px rgba(0, 0, 0, 0.18)',
})

const header = style({
  padding: '8px',
})

const content = style({
  padding: '8px',
})

const divider = style({
  width: '100%',
  height: '2px',
  border: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.12)',
  margin: '8px 0 8px',
})

const flush = style({
  $nest: {
    [`&.${content}`]: { padding: '0' },
    [`&.${panel}`]: { margin: '0' },
    [`&.${divider}`]: { margin: '0' },
  },
})

export const defaultPanelTheme = {
  panel,
  header,
  content,
  flush,
  divider,
}

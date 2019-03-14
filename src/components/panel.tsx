import * as React from 'react'
import { ReactNode } from 'react'
import { style } from 'typestyle'
import { joinNames, justifyBetween, ClassName, alignCenter } from './styles'
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
      className={joinNames(
        className,
        justifyBetween,
        alignCenter,
        theme.header,
      )}
    >
      <Text title>{text}</Text>
      <div>{children}</div>
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

export function PanelDivider() {
  return <hr className={divider} />
}

const panel = style({
  borderRadius: 4,
  paddingTop: '24px',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 1px 1px rgba(0, 0, 0, 0.18)',
})

const header = style({
  padding: '0 12px 24px',
})

const content = style({
  padding: '0 12px 24px',
})

const divider = style({
  backgroundColor: 'rgba(20, 20, 30, 0.35)',
  height: '2px',
  margin: '0 0 24px',
  border: 'none',
})

const flush = style({
  $nest: {
    [`&.${content}`]: {
      padding: '0 0 24px',
    },
  },
})

export const defaultPanelTheme = {
  panel,
  header,
  content,
  flush,
  divider,
}

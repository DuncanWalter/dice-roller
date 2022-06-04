import * as React from 'react'

import { Text } from './text'
import { readOption, ClassName, joinNames } from './styles'
import { style } from 'typestyle'
import { useTheme } from './theme'

export interface ButtonTheme {
  button: string
  primary: string
  secondary: string
  danger: string
  disabled: string
  icon: string
}

type ButtonType = 'disabled' | 'primary' | 'secondary' | 'danger' | 'icon'

const types: ButtonType[] = [
  'disabled',
  'primary',
  'secondary',
  'danger',
  'icon',
]

export interface ButtonProps {
  className?: ClassName
  disabled?: boolean
  primary?: boolean
  secondary?: boolean
  danger?: boolean
  icon?: boolean
  type?: ButtonType
  text?: string
  onClick?: () => unknown
  children?: never
}

export function Button(props: ButtonProps) {
  const { text, onClick, children, className } = props
  const { button: theme } = useTheme()
  if (children) {
    console.error('Use the "text" prop of Button instead of passing children')
  }
  const type = readOption(types, props, 'secondary')
  return (
    <div
      onClick={props.disabled ? undefined : onClick}
      className={joinNames(theme.button, className, {
        [theme.primary]: type === 'primary',
        [theme.secondary]: type === 'secondary',
        [theme.danger]: type === 'danger',
        [theme.icon]: type === 'icon',
        [theme.disabled]: type === 'disabled',
      })}
      onKeyDown={(evt) => {
        if (evt.key === 'Enter' && onClick && !props.disabled) {
          onClick()
          evt.stopPropagation()
        }
      }}
      tabIndex={type !== 'disabled' && type !== 'icon' ? 0 : undefined}
    >
      <Text button>{text}</Text>
    </div>
  )
}

const button = style({
  // borderRadius: '4px',
  border: 'solid black 2px',
  borderRadius: '9999px',
  color: '#ffffff',
  cursor: 'pointer',
  padding: '6px 12px 6px',
  margin: '0 4px 0',
  transition: '0.2s',
  textAlign: 'center',
})

const icon = style({
  border: 'none',
  $nest: {
    [`&.${button}`]: {
      margin: 0,
      padding: '6px 0 6px',
    },
  },
})

const disabled = style({
  $nest: {
    [`&.${button}`]: {
      backgroundColor: '#9999a3',
      color: '#222233',
      cursor: 'not-allowed',
      $nest: {
        '&:hover': {
          backgroundColor: '#9999a3',
          color: '#222233',
        },
      },
    },
  },
})

const primary = style({
  $nest: {
    [`&.${button}`]: {
      backgroundColor: 'rgb(94, 135, 201)',
      $nest: {
        '&:hover': {
          backgroundColor: 'rgba(94, 135, 201, 0.8)',
        },
      },
    },
  },
})

const danger = style({
  $nest: {
    [`&.${button}`]: {
      backgroundColor: 'rgb(221, 72, 56)',
      $nest: {
        '&:hover': {
          backgroundColor: 'rgba(221, 72, 56, 0.8)',
        },
      },
    },
  },
})

const secondary = style({
  $nest: {
    [`&.${button}`]: {
      color: '#222299',
      backgroundColor: 'rgba(221, 221, 245, 0.20)',
      $nest: {
        '&:hover': {
          color: '#5555aa',
          backgroundColor: 'rgba(221, 221, 245, 0.35)',
        },
      },
    },
  },
})

export const defaultButtonTheme: ButtonTheme = {
  button,
  disabled,
  primary,
  secondary,
  danger,
  icon,
}

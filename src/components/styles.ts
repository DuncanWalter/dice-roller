import classNames from 'classnames'
import { style } from 'typestyle'

export { classNames as joinNames }

export type ClassName =
  | string
  | false
  | null
  | undefined
  | { [className: string]: unknown }
  | ClassName[]

export function readOption<T extends string>(
  options: T[],
  props: Partial<Record<T, boolean | undefined>> & { type?: T },
  defaultValue?: T,
): T | undefined {
  return (
    options.filter((option) => props[option] || props.type === option)[0] ||
    defaultValue
  )
}

export const justifyCenter = style({
  display: 'flex',
  justifyContent: 'center',
})

export const justifyEnd = style({
  display: 'flex',
  justifyContent: 'flex-end',
})

export const justifyAround = style({
  display: 'flex',
  justifyContent: 'space-around',
})

export const justifyStart = style({
  display: 'flex',
  justifyContent: 'flex-start',
})

export const justifyBetween = style({
  display: 'flex',
  justifyContent: 'space-between',
})

export const alignCenter = style({
  display: 'flex',
  alignItems: 'center',
})

export const alignStretch = style({
  display: 'flex',
  alignItems: 'stretch',
})

export const alignStart = style({
  display: 'flex',
  alignItems: 'start',
})

export const alignEnd = style({
  display: 'flex',
  alignItems: 'end',
})

export const row = style({
  display: 'flex',
  flexDirection: 'row',
})

export const column = style({
  display: 'flex',
  flexDirection: 'column',
})

export const flex = style({
  flex: 1,
})

export const noFlex = style({
  flex: 0,
})

export function grow(n: number) {
  return style({
    flexGrow: n,
  })
}

export const flexGap = style({
  gap: '8px',
})

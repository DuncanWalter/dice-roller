import React, { MouseEvent } from 'react'
import { style, keyframes } from 'typestyle'
import { rgba, cssColor, createSpectrum } from './color'
import {
  justifyCenter,
  joinNames,
  alignCenter,
  Text,
  defaultTextTheme,
} from './components'
import { incrementDie, rerollDie } from './state'
import { Atom } from './state-store'
import { useDispatch, useStoreValue } from './state-store-react'

export interface Die {
  faces: number
  roll: number
}

interface DieTypeProps {
  faces: number
  onClick: (event: MouseEvent) => void
}

export function RolledDie({ die }: { die: Atom<Die> }) {
  const dispatch = useDispatch()
  const { faces, roll } = useStoreValue(die)

  function onClickRolledDie(event: MouseEvent) {
    if (event.getModifierState('Alt')) {
      return dispatch(incrementDie(die))
    }
    dispatch(rerollDie(die))
  }

  return (
    <div
      className={joinNames(
        dieStyle,
        animateDie,
        justifyCenter,
        alignCenter,
        diceColors[faces],
        roll === faces && maxRollShine,
      )}
      onDoubleClick={(event) => event.preventDefault()}
      onClick={onClickRolledDie}
    >
      <div className={dieHighlight} />
      <Text className={bigText}>{`${roll}`}</Text>
      {/* <Text className={subText}>{`/ ${faces}`}</Text> */}
    </div>
  )
}

export function DieType({ faces, onClick }: DieTypeProps) {
  return (
    <div
      className={joinNames(
        dieStyle,
        animateDie,
        justifyCenter,
        alignCenter,
        diceColors[faces],
      )}
      onDoubleClick={(event) => event.preventDefault()}
      onClick={onClick}
    >
      <div className={dieHighlight} />
      <Text className={dieText}>{`d${faces}`}</Text>
    </div>
  )
}

export function RollModifier({
  mod,
  onClick,
}: {
  mod: number
  onClick?: (event: MouseEvent) => void
}) {
  return (
    <div
      className={joinNames(dieStyle, animateDie, justifyCenter, alignCenter)}
      onClick={onClick}
    >
      <Text className={dieText}>{`${mod > 0 ? `+${mod}` : `${mod}`}`}</Text>
    </div>
  )
}

const diceSpectrum = createSpectrum([
  { value: 0, color: rgba(0, 0, 0) },
  { value: 4, color: rgba(69, 36, 65) },

  { value: 6, color: rgba(205, 17, 47) },
  { value: 8, color: rgba(255, 125, 51) },

  { value: 10, color: rgba(255, 225, 35) },
  { value: 12, color: rgba(255, 255, 175) },

  { value: 20, color: rgba(163, 255, 247) },
])

const diceColors = [] as string[]

for (let i = 0; i <= 20; i++) {
  const color = diceSpectrum(i)
  diceColors.push(
    style({
      backgroundColor: cssColor(color),
      $nest: {
        '&:hover': {
          backgroundColor: cssColor({ ...color, a: 0.75 }),
        },
      },
    }),
  )
}

const dieStyle = style({
  width: '70px',
  height: '70px',
  position: 'relative',
  borderRadius: '35px',
  boxSizing: 'border-box',
  padding: '0',
  margin: '16px 8px 0',
  cursor: 'pointer',
  userSelect: 'none',
  border: 'solid 2px #18181d',
})

const dieHighlight = style({
  position: 'absolute',
  borderRadius: '33px 33px 0 0',
  top: 0,
  left: 0,
  right: 0,
  width: '66px',
  height: '33px',
  backgroundColor: 'rgba(255, 255, 255, 0.28)',
})

const animateDie = style({
  $nest: {
    [`&.${dieStyle}`]: {
      animationName: keyframes({
        '0%': { margin: '-35px', opacity: 0 },
        '100%': { margin: '8px', opacity: 1.0 },
      }),
      animationDuration: '0.3s',
      animationIterationCount: '1',
    },
  },
})

const dieText = style({
  fontSize: '28px',
  color: '#f0f2ee',
  fontWeight: 'bold',
  zIndex: 1,
  margin: '0 2px 0',
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

const bigText = style({
  fontSize: '32px',
  color: '#f0f2ee',
  fontWeight: 'bold',
  zIndex: 1,
  margin: '0 2px 0',
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

export const totalText = style({
  $nest: {
    [`&.${defaultTextTheme.title}`]: {
      fontSize: '64px',
      fontWeight: 'bold',
    },
  },
})

const maxRollShine = style({
  boxShadow: '0 0 36px 4px #4cd9f5, 0 0 8px #23616e',
})

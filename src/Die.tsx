import React, { MouseEvent } from 'react'
import { style, keyframes } from 'typestyle'
import { rgba, cssColor, createSpectrum } from './color'
import { justifyCenter, joinNames, alignCenter, Text } from './components'

interface DieProps {
  faces: number
  index?: number
  roll?: number
  onClick: (
    index: number,
    faces: number,
    roll: number,
  ) => (event: MouseEvent) => void
}

export function Die({ faces, roll = faces, onClick, index = -1 }: DieProps) {
  return (
    <div
      className={joinNames(
        die,
        animateDie,
        justifyCenter,
        alignCenter,
        diceColors[faces],
      )}
      onDoubleClick={event => event.preventDefault()}
      onClick={onClick(index, faces, roll)}
    >
      <div className={dieHighlight} />
      <Text className={dieText}>{`${roll}`}</Text>
    </div>
  )
}

const diceSpectrum = createSpectrum([
  { value: 0, color: rgba(0, 0, 0) },
  { value: 1, color: rgba(69, 36, 65) },
  { value: 3, color: rgba(88, 24, 69) },
  { value: 5, color: rgba(144, 12, 63) },
  { value: 7, color: rgba(199, 0, 57) },
  { value: 9, color: rgba(255, 87, 51) },
  { value: 11, color: rgba(255, 195, 0) },
  { value: 20, color: rgba(218, 247, 166) },
])

const diceColors = [] as string[]

for (let i = 0; i <= 20; i++) {
  const color = diceSpectrum(i)
  diceColors.push(
    style({
      backgroundColor: cssColor(color),
      $nest: {
        '&:hover': {
          backgroundColor: cssColor({ ...color, a: 0.8 }),
        },
      },
    }),
  )
}

const die = style({
  width: '70px',
  height: '70px',
  position: 'relative',
  borderRadius: '35px',
  boxSizing: 'border-box',
  padding: '0',
  margin: '12px',
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
  backgroundColor: 'rgba(255, 255, 255, 0.22)',
})

const animateDie = style({
  $nest: {
    [`&.${die}`]: {
      animationName: keyframes({
        '0%': { margin: '-35px', opacity: 0 },
        '100%': { margin: '12px', opacity: 1.0 },
      }),
      animationDuration: '0.3s',
      animationIterationCount: '1',
    },
  },
})

const dieText = style({
  fontSize: '32px',
  color: '#f0f2ee',
  fontWeight: 'bold',
  zIndex: 1,
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

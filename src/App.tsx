import React, { useEffect, Fragment, MouseEvent } from 'react'
import { useActions, useSelector } from '@dwalter/spider-hook'
import {
  addDieRoll,
  clearDice,
  rerollDie,
  getDice,
  getTotal,
  removeDie,
  incrementDie,
} from './state'
import {
  Panel,
  PanelHeader,
  PanelContent,
  Button,
  joinNames,
  justifyCenter,
  Text,
  PanelDivider,
  alignCenter,
} from './components'
import { style, keyframes } from 'typestyle'

import texture from './texture.png'
import { createSpectrum, rgba, cssColor } from './color'

export function App() {
  const dice = useSelector(getDice)
  const total = useSelector(getTotal)

  const actions = useActions({
    addDieRoll,
    rerollDie,
    clearDice,
    removeDie,
    incrementDie,
  })

  useEffect(() => {
    function callback(event: KeyboardEvent) {
      if (event.key === ' ') {
        actions.clearDice()
        event.preventDefault()
      }
      if (event.key === '0') {
        actions.addDieRoll(10)
      }
      for (let i = 2; i <= 9; i++) {
        if (event.key == `${i}`) {
          actions.addDieRoll(i)
        }
      }
      if (event.key == 'Enter') {
        actions.addDieRoll(20)
      }
    }

    window.addEventListener('keyup', callback)

    return () => {
      window.removeEventListener('keyup', callback)
    }
  }, [])

  return (
    <div className={joinNames(app, justifyCenter, alignStart)}>
      <Panel>
        <PanelHeader className={alignCenter} text="Dinky Dice Tower">
          <Button
            danger
            className={boldButton}
            text="Clear"
            onClick={actions.clearDice}
          />
        </PanelHeader>
        <PanelContent className={wrap}>
          <Text body>
            Click on a die in the top section to add another die to the roll.
            Hit the space bar to clear all dice. Click a rolled die to reroll
            it. Ctrl or cmd click on a rolled die to clear that die. Alt or opt
            click on a rolled die to increment its value.
          </Text>
        </PanelContent>
        <PanelContent className={justifyCenter}>
          {[4, 6, 8, 10, 12, 20].map(faces => (
            <div
              key={faces}
              className={joinNames(
                dieStyle,
                justifyCenter,
                alignCenter,
                diceStyles[faces],
              )}
              onClick={() => actions.addDieRoll(faces)}
              onDoubleClick={event => event.preventDefault()}
            >
              <Text className={dieText}>{`${faces}`}</Text>
            </div>
          ))}
        </PanelContent>
        <PanelDivider />
        {dice.length > 0 ? (
          <Fragment>
            <PanelContent
              className={joinNames(wrap, justifyCenter, alignCenter)}
            >
              {dice.map((die, index) => (
                <div
                  key={index}
                  className={joinNames(
                    dieStyle,
                    animateDie,
                    justifyCenter,
                    alignCenter,
                    diceStyles[die.faces],
                  )}
                  onClick={onClickRolledDie(index, die)}
                >
                  <Text className={dieText}>{`${die.roll}`}</Text>
                </div>
              ))}
            </PanelContent>
            <PanelDivider />
          </Fragment>
        ) : (
          undefined
        )}
        <PanelContent className={justifyCenter}>
          <Text title>{`TOTAL: ${total}`}</Text>
        </PanelContent>
      </Panel>
    </div>
  )

  function onClickRolledDie(
    index: number,
    die: { roll: number; faces: number },
  ) {
    return (event: MouseEvent) => {
      if (event.getModifierState('Control')) {
        actions.removeDie(index)
        return
      }
      if (event.getModifierState('Meta')) {
        actions.removeDie(index)
        return
      }
      if (event.getModifierState('Alt')) {
        actions.incrementDie(index, die)
        return
      }
      actions.rerollDie(index, die)
    }
  }
}

const dieStyle = style({
  width: '70px',
  height: '70px',
  borderRadius: '35px',
  boxSizing: 'border-box',
  padding: '0',
  margin: '12px',
  cursor: 'pointer',
  userSelect: 'none',
  border: 'solid 2px #18181d',
})

const animateDie = style({
  $nest: {
    [`&.${dieStyle}`]: {
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
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

const boldButton = style({
  border: 'solid 2px #18181d',
  boxSizing: 'border-box',
  color: '#f0f2ee',
  fontWeight: 'bold',
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

const diceSpectrum = createSpectrum([
  { value: 0, color: rgba(0, 0, 0) },
  { value: 2, color: rgba(69, 36, 65) },
  { value: 4, color: rgba(88, 24, 69) },
  { value: 6, color: rgba(144, 12, 63) },
  { value: 8, color: rgba(199, 0, 57) },
  { value: 10, color: rgba(255, 87, 51) },
  { value: 12, color: rgba(255, 195, 0) },
  { value: 20, color: rgba(218, 247, 166) },
])

const diceStyles = [] as string[]

for (let i = 0; i <= 20; i++) {
  const color = diceSpectrum(i)
  diceStyles.push(
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

const app = style({
  position: 'relative',
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  backgroundColor: '#a1a5a8',
  padding: '12px',
  boxSizing: 'border-box',
  backgroundImage: `url(${texture})`,
})

const wrap = style({
  display: 'flex',
  flexWrap: 'wrap',
  width: '600px',
})

const alignStart = style({
  display: 'flex',
  alignItems: 'start',
})

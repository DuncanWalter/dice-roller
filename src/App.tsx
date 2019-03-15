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
  Tooltip,
  row,
} from './components'
import { style, keyframes } from 'typestyle'

import texture from './texture.png'

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
      for (let i = 2; i <= 9; i++) {
        if (event.key == `${i}`) {
          actions.addDieRoll(i)
        }
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
              className={joinNames(dieStyle, justifyCenter, alignCenter, {
                [muteRed]: faces == 4,
                [muteGreen]: faces == 6,
                [muteBlue]: faces == 8,
                [brightRed]: faces == 10,
                [brightGreen]: faces == 12,
                [brightBlue]: faces == 20,
                [deepRed]: faces == 2 || faces % 2 !== 0,
              })}
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
                    {
                      [muteRed]: die.faces == 4,
                      [muteGreen]: die.faces == 6,
                      [muteBlue]: die.faces == 8,
                      [brightRed]: die.faces == 10,
                      [brightGreen]: die.faces == 12,
                      [brightBlue]: die.faces == 20,
                      [deepRed]: die.faces == 2 || die.faces % 2 !== 0,
                    },
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

const deepRed = style({
  backgroundColor: 'rgb(69, 36, 65)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(88, 24, 69, 0.8)',
    },
  },
})

const muteRed = style({
  backgroundColor: 'rgb(88, 24, 69)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(88, 24, 69, 0.8)',
    },
  },
})

const muteGreen = style({
  backgroundColor: 'rgb(144, 12, 63)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(144, 12, 63, 0.8)',
    },
  },
})

const muteBlue = style({
  backgroundColor: 'rgb(199, 0, 57)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(199, 0, 57, 0.8)',
    },
  },
})

const brightRed = style({
  backgroundColor: 'rgb(255, 87, 51)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(255, 87, 51, 0.8)',
    },
  },
})

const brightGreen = style({
  backgroundColor: 'rgb(255, 195, 0)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(255, 195, 0, 0.8)',
    },
  },
})

const brightBlue = style({
  backgroundColor: 'rgb(218, 247, 166)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(218, 247, 166, 0.8)',
    },
  },
})

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

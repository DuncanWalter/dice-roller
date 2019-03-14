import React, { useEffect } from 'react'
import { useActions, useSelector } from '@dwalter/spider-hook'
import { addDieRoll, clearDice, rerollDie, getDice, getTotal } from './state'
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

export function App() {
  const dice = useSelector(getDice)
  const total = useSelector(getTotal)

  const actions = useActions({
    addDieRoll,
    rerollDie,
    clearDice,
  })

  useEffect(() => {
    function callback(event: KeyboardEvent) {
      if (event.key === ' ') {
        actions.clearDice()
        event.preventDefault()
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
        <PanelHeader text="Dinky Dice Tower">
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
            Click a rolled die to reroll it. Hit the space bar to clear all
            dice.
          </Text>
        </PanelContent>
        {/* <PanelDivider /> */}
        <PanelContent className={justifyCenter}>
          {[4, 6, 8, 10, 12, 20].map(faces => (
            <div
              key={faces}
              className={joinNames(dieStyle, justifyCenter, alignCenter, {
                [red]: faces == 4,
                [blue]: faces == 6,
                [gray]: faces == 8,
                [green]: faces == 10,
                [orange]: faces == 12,
                [purple]: faces == 20,
              })}
              onClick={() => actions.addDieRoll(faces)}
              onDoubleClick={event => event.preventDefault()}
            >
              <Text className={dieText}>{`${faces}`}</Text>
            </div>
          ))}
        </PanelContent>
        <PanelDivider />
        <PanelContent className={joinNames(wrap, justifyCenter, alignCenter)}>
          {dice.map((die, index) => (
            <div
              key={index}
              className={joinNames(
                dieStyle,
                animateDie,
                justifyCenter,
                alignCenter,
                {
                  [red]: die.faces == 4,
                  [blue]: die.faces == 6,
                  [gray]: die.faces == 8,
                  [green]: die.faces == 10,
                  [orange]: die.faces == 12,
                  [purple]: die.faces == 20,
                },
              )}
              onClick={() => actions.rerollDie(index, die)}
            >
              <Text className={dieText}>{`${die.roll}`}</Text>
            </div>
          ))}
        </PanelContent>
        <PanelDivider />
        <PanelContent className={justifyCenter}>
          <Text title>TOTAL:</Text>
          <Text title>{`${total}`}</Text>
        </PanelContent>
      </Panel>
    </div>
  )
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

const orange = style({
  backgroundColor: 'rgb(201, 134, 34)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(201, 134, 34, 0.8)',
    },
  },
})

const green = style({
  backgroundColor: 'rgb(34, 201, 134)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(34, 201, 134, 0.8)',
    },
  },
})

const blue = style({
  backgroundColor: 'rgb(34, 134, 201)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(34, 134, 201, 0.8)',
    },
  },
})

const gray = style({
  backgroundColor: 'rgb(134, 134, 187)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(134, 134, 187, 0.8)',
    },
  },
})

const red = style({
  backgroundColor: 'rgb(213, 85, 43)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(213, 85, 43, 0.8)',
    },
  },
})

const purple = style({
  backgroundColor: 'rgb(167, 45, 187)',
  $nest: {
    '&:hover': {
      backgroundColor: 'rgba(167, 45, 187, 0.8)',
    },
  },
})

const app = style({
  minHeight: '100vh',
  backgroundColor: '#dddde4',
  padding: '24px',
  boxSizing: 'border-box',
  backgroundImage: 'url(./texture.png)',
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

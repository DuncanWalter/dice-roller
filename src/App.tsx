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
  getRollPercentile,
  getMaximum,
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
  alignStart,
} from './components'
import { style } from 'typestyle'

import texture from './texture.png'
import { Die } from './Die'

export function App() {
  const dice = useSelector(getDice)
  const total = useSelector(getTotal)

  const actions = useActions({
    addDieRoll,
    clearDice,
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

    window.addEventListener('keydown', callback)

    return () => {
      window.removeEventListener('keydown', callback)
    }
  }, [])

  function onClickMasterDie(_: unknown, faces: number) {
    return () => actions.addDieRoll(faces)
  }

  return (
    <div className={joinNames(app, justifyCenter, alignStart)}>
      <Panel>
        <PanelHeader className={alignCenter} text="D & Dice Tower">
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
            <Die key={faces} faces={faces} onClick={onClickMasterDie} />
          ))}
        </PanelContent>
        <PanelDivider />
        {dice.length > 0 && <RolledDice />}
        <PanelContent className={justifyCenter}>
          <Tooltip content={<RollStats />}>
            <Text title>{`TOTAL: ${total}`}</Text>
          </Tooltip>
        </PanelContent>
      </Panel>
    </div>
  )
}

function RolledDice() {
  const dice = useSelector(getDice)

  const actions = useActions({
    rerollDie,
    removeDie,
    incrementDie,
  })

  function onClickRolledDie(index: number, faces: number, roll: number) {
    return (event: MouseEvent): void => {
      if (event.getModifierState('Control')) {
        actions.removeDie(index)
        return
      }
      if (event.getModifierState('Meta')) {
        actions.removeDie(index)
        return
      }
      if (event.getModifierState('Alt')) {
        actions.incrementDie(index, { faces, roll })
        return
      }
      actions.rerollDie(index, { faces, roll })
    }
  }

  return (
    <Fragment>
      <PanelContent className={joinNames(wrap, justifyCenter, alignCenter)}>
        {dice.map((die, index) => (
          <Die
            key={index}
            index={index}
            faces={die.faces}
            roll={die.roll}
            onClick={onClickRolledDie}
          />
        ))}
      </PanelContent>
      <PanelDivider />
    </Fragment>
  )
}

function RollStats() {
  const min = useSelector(getDice).length
  const max = useSelector(getMaximum)
  const percentile = useSelector(getRollPercentile)

  return (
    <Panel flush>
      <PanelContent>
        <Text body>{`Minimum: ${min}`}</Text>
        <Text body>{`Maximum: ${max}`}</Text>
        <Text body>{`Expected: ${(min + max) / 2}`}</Text>
        <Text body>{`Percentile: ${percentile}`}</Text>
      </PanelContent>
    </Panel>
  )
}

const app = style({
  position: 'relative',
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  backgroundColor: '#a1a5a8',
  padding: '12px',
  boxSizing: 'border-box',
  background: `repeating-linear-gradient(
    -55deg,
    #d1d1d8,
    #d1d1d8 20px,
    #d3d3da 20px,
    #d3d3da 40px
  )`,
})

const wrap = style({
  display: 'flex',
  flexWrap: 'wrap',
  width: '600px',
})

const boldButton = style({
  border: 'solid 2px #18181d',
  boxSizing: 'border-box',
  color: '#f0f2ee',
  fontWeight: 'bold',
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

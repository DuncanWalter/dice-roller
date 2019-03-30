import React, {
  useEffect,
  Fragment,
  MouseEvent,
  ReactNode,
  ReactNodeArray,
} from 'react'
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
  Case,
  column,
  Responsive,
} from './components'
import { style } from 'typestyle'

import { Die } from './Die'

export function App() {
  const dice = useSelector(getDice)
  const total = useSelector(getTotal)

  const actions = useActions({
    addDieRoll,
    clearDice,
    rerollDice() {
      return (dispatch, resolve) =>
        dispatch(resolve(getDice).map((die, index) => rerollDie(index, die)))
    },
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
      if (event.key === 'r') {
        actions.rerollDice()
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
    <ResponsivePage>
      <PanelHeader className={alignCenter} text="D & Dice Tower">
        <Button
          danger
          className={boldButton}
          text="Clear"
          onClick={actions.clearDice}
        />
      </PanelHeader>
      <PanelContent>
        <Text body>
          Click on a die in the top section to add another die to the roll. Hit
          the space bar to clear all dice. Click a rolled die to reroll it. Ctrl
          or cmd click on a rolled die to clear that die. Alt or opt click on a
          rolled die to increment its value.
        </Text>
      </PanelContent>
      <PanelContent className={joinNames(wrap, justifyCenter)}>
        {[4, 6, 8, 10, 12, 20].map(faces => (
          <Die key={faces} faces={faces} onClick={onClickMasterDie} />
        ))}
      </PanelContent>
      <PanelDivider />
      {dice.length > 0 && <RolledDice />}
      <div style={{ flex: 1 }} />
      <PanelContent className={justifyCenter}>
        <Tooltip content={<RollStats />}>
          <Text title>{`TOTAL: ${total}`}</Text>
        </Tooltip>
      </PanelContent>
    </ResponsivePage>
  )
}

function ResponsivePage({
  children,
}: {
  children: ReactNode | ReactNodeArray
}) {
  return (
    <Responsive>
      <Case
        minWidth={0}
        content={
          <div
            className={joinNames(mobileApp, column, justifyCenter, alignCenter)}
          >
            {children}
          </div>
        }
      />
      <Case
        minWidth={648}
        content={
          <div className={joinNames(desktopApp, justifyCenter, alignStart)}>
            <Panel className={appPanel}>{children} </Panel>
          </div>
        }
      />
    </Responsive>
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

const desktopApp = style({
  position: 'relative',
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  backgroundColor: 'rgb(235, 239, 244)',
  padding: '12px',
  boxSizing: 'border-box',
})

const appPanel = style({
  width: '600px',
})

const mobileApp = style({
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  padding: '12px',
  boxSizing: 'border-box',
})

const wrap = style({
  display: 'flex',
  flexWrap: 'wrap',
})

const boldButton = style({
  border: 'solid 2px #18181d',
  boxSizing: 'border-box',
  color: '#f0f2ee',
  fontWeight: 'bold',
  textShadow:
    '1px 1px 1px black, -1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black',
})

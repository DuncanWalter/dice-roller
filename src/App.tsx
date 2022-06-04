import React, { useEffect, Fragment, useState, useRef } from 'react'
import { addDieRoll, clearDice, diceAtom, getRollStats } from './state'
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
  alignStart,
  Case,
  column,
  Responsive,
  justifyStart,
  row,
  flexGap,
} from './components'
import { style } from 'typestyle'

import { RolledDie, DieType, RollModifier, Die, totalText } from './Die'
import { Atom, createAtom, Dispatch, Peek } from './state-store'
import {
  useDispatch,
  usePeek,
  useStoreValue,
  useSubscribe,
} from './state-store-react'
import { Memo } from './components/memo'
import { BulletGraph } from './bullet-graphs'
import { createSpectrum, cssColor, rgba } from './color'

function rerollDice(dispatch: Dispatch, peek: Peek) {
  dispatch(
    peek(diceAtom).map((dieAtom) =>
      dieAtom.update((die) => ({
        faces: die.faces,
        roll: 1 + Math.floor(Math.random() * die.faces),
      })),
    ),
  )
}

const initial =
  JSON.parse(localStorage.getItem('saved-roll-presets') || 'false') || []

const presetsAtom = createAtom<
  Array<
    Atom<{
      name: string
      diceFaces: number[]
      mod: number
      editing: boolean
    }>
  >
>(
  initial.map(
    (savedRoll: {
      name: string
      diceFaces: number[]
      mod: number
      editing: boolean
    }) => createAtom(savedRoll),
  ),
)

function createHotkeyHandler(
  dispatch: Dispatch,
  modifierAtom: Atom<number>,
  diceAtom: Atom<Atom<Die>[]>,
) {
  return function hotkeyHandler(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement) {
      return
    } else if (event.key === 'c' || event.key === 'C' || event.key === ' ') {
      dispatch([clearDice(), modifierAtom.set(0)])
    } else if (event.key === '0') {
      dispatch(addDieRoll(10))
    } else if (event.key == 'Enter') {
      dispatch(addDieRoll(20))
    } else if (event.key === 's' || event.key === 'S') {
      dispatch((d, peek) => {
        if (peek(diceAtom).length) {
          d(
            createPresetFromRoll(
              peek(diceAtom).map((dieAtom) => peek(dieAtom).faces),
              peek(modifierAtom),
            ),
          )
          event.preventDefault()
        }
      })
    } else if (event.key === 'r' || event.key === 'R') {
      dispatch(rerollDice)
    }

    for (let i = 2; i <= 9; i++) {
      if (event.key == `${i}`) {
        dispatch(addDieRoll(i))
      }
    }

    const idx = '!@#$%^&*()'.indexOf(event.key)
    if (idx > -1) {
      dispatch(modifierAtom.update((mod) => mod + idx + 1))
    }
  }
}

const justifyCenterSpecific = style({
  $nest: {
    'div&': {
      justifyContent: 'center',
    },
  },
})

function MobileApp({
  modifierAtom,
  infoAtom,
  mobileAtom,
}: {
  modifierAtom: Atom<number>
  infoAtom: Atom<boolean>
  mobileAtom: Atom<'mobile' | 'desktop' | 'auto'>
}) {
  const dispatch = useDispatch()

  const info = useStoreValue(infoAtom)
  const mod = useStoreValue(modifierAtom)
  const diceFaces = usePeek(
    (peek) => peek(diceAtom).map((dieAtom) => peek(dieAtom).faces),
    [diceAtom],
  )

  useEffect(
    () => {
      const callback = createHotkeyHandler(dispatch, modifierAtom, diceAtom)
      window.addEventListener('keydown', callback)
      return () => window.removeEventListener('keydown', callback)
    },
    [mod, diceFaces],
  )

  return (
    <div className={joinNames(mobileApp, column, justifyCenter, alignCenter)}>
      {info ? (
        <Fragment>
          <PanelHeader className={justifyCenterSpecific} text="Info" />
          <PanelDivider />
          <Info />
          <div style={{ flex: 1 }} />
          <PanelContent>
            <div className={row}>
              <Button
                primary
                text="Back"
                onClick={() => dispatch(infoAtom.update((last) => !last))}
              />
              <Button
                primary
                text="Desktop"
                onClick={() => dispatch(mobileAtom.set('desktop'))}
              />
            </div>
          </PanelContent>
        </Fragment>
      ) : (
        <Fragment>
          <PanelHeader className={justifyCenterSpecific} text="Dice Tower" />
          <PanelDivider />
          <RollStats modifierAtom={modifierAtom} />
          <RolledDice rollModifier={modifierAtom} />
          <div style={{ flex: 1 }} />
          <PanelContent>
            <div className={joinNames(wrap, justifyCenter)}>
              {[4, 6, 8, 10, 12, 20].map((faces) => (
                <DieType
                  key={faces}
                  faces={faces}
                  onClick={() => dispatch(addDieRoll(faces))}
                />
              ))}
            </div>
            <div className={joinNames(wrap, justifyCenter)}>
              {[-1, 1, 2, 5, 10].map((mod) => (
                <RollModifier
                  key={mod}
                  mod={mod}
                  onClick={() =>
                    dispatch(modifierAtom.update((last) => last + mod))
                  }
                />
              ))}
            </div>
          </PanelContent>
          <PanelContent>
            <div className={joinNames(row, justifyCenter)}>
              <Button
                primary
                text="Info"
                onClick={() => dispatch(infoAtom.update((last) => !last))}
              />
              <Button
                primary
                text="Desktop"
                onClick={() => dispatch(mobileAtom.set('desktop'))}
              />
              <Button
                disabled={!(mod || diceFaces.length)}
                danger={!!(mod || diceFaces.length)}
                text="Clear"
                onClick={() => dispatch([clearDice(), modifierAtom.set(0)])}
              />
              <Button
                disabled={!diceFaces.length}
                primary={!!diceFaces.length}
                text="Reroll"
                onClick={() => dispatch(rerollDice)}
              />
            </div>
          </PanelContent>
        </Fragment>
      )}
    </div>
  )
}

function Info() {
  return (
    <PanelContent>
      <Text body>
        This is a dice roller intended for d20 tabletop RPGs like D&D and
        Pathfinder.
      </Text>
      <Text body>
        Click on "d6" or hit "6" to add a six sided die to your roll. The
        hotkeys for ten and twenty sided dice are "0" and "Enter" respectively.
      </Text>
      <Text body>
        Click on "+5" or hit "Shift + 5" to add a flat +5 modifier to your roll.
        Modifiers stack.
      </Text>
      <Text body>
        Click on a rolled die to reroll it. To reroll all dice, click "(R)eroll"
        or hit "r".
      </Text>
      <Text body>
        Click "(C)lear", hit the spacebar, or hit "c" to clear the current roll.
      </Text>
      <Text body>
        Click "(S)ave" or hit "s" to save your current combination of rolled
        dice and modifiers for reuse later. You can name saved rolls. Saved
        rolls persist across multiple visits to this tool. This feature is only
        available in desktop mode.
      </Text>
    </PanelContent>
  )
}

function DesktopApp({
  modifierAtom,
  infoAtom,
  mobileAtom,
}: {
  modifierAtom: Atom<number>
  infoAtom: Atom<boolean>
  mobileAtom: Atom<'mobile' | 'desktop' | 'auto'>
}) {
  const dispatch = useDispatch()

  const info = useStoreValue(infoAtom)
  const mod = useStoreValue(modifierAtom)
  const dice = useStoreValue(diceAtom)

  useEffect(
    () => {
      const callback = createHotkeyHandler(dispatch, modifierAtom, diceAtom)
      window.addEventListener('keydown', callback)
      return () => window.removeEventListener('keydown', callback)
    },
    [mod],
  )

  const content = info ? (
    <Fragment>
      <PanelHeader text="Info">
        <div className={row}>
          <Button
            primary
            text="Back"
            onClick={() => dispatch(infoAtom.update((last) => !last))}
          />
          <Button
            primary
            text="Mobile"
            onClick={() => dispatch(mobileAtom.set('mobile'))}
          />
        </div>
      </PanelHeader>
      <PanelDivider />
      <Info />
    </Fragment>
  ) : (
    <Fragment>
      <PanelHeader className={alignCenter} text="Dice Tower">
        <div className={row}>
          <Button
            primary
            text="Info"
            onClick={() => dispatch(infoAtom.update((last) => !last))}
          />
          <Button
            primary
            text="Mobile"
            onClick={() => dispatch(mobileAtom.set('mobile'))}
          />
        </div>
      </PanelHeader>
      <PanelDivider />
      <PanelContent className={joinNames(wrap, justifyCenter)}>
        {[4, 6, 8, 10, 12, 20].map((faces) => (
          <DieType
            key={faces}
            faces={faces}
            onClick={() => dispatch(addDieRoll(faces))}
          />
        ))}
        {[-1, 1, 2, 5, 10].map((mod) => (
          <RollModifier
            key={mod}
            mod={mod}
            onClick={() => dispatch(modifierAtom.update((last) => last + mod))}
          />
        ))}
      </PanelContent>
      <PanelDivider />
      <RolledDice rollModifier={modifierAtom} />
      {dice.length || mod ? <PanelDivider /> : null}
      <div style={{ flex: 1 }} />
      <RollSummary rollModifier={modifierAtom} />
    </Fragment>
  )

  return (
    <div className={joinNames(desktopApp, justifyCenter, alignStart)}>
      <Panel className={appPanel}>{content}</Panel>
      <div className={joinNames(column)}>
        <Panel className={sidePanel}>
          <PanelContent>
            <Text header>Roll Stats</Text>
          </PanelContent>
          <PanelDivider />
          <RollStats modifierAtom={modifierAtom} />
        </Panel>
        <Panel className={sidePanel}>
          <PanelContent>
            <Text header>Saved Rolls</Text>
          </PanelContent>
          <PanelDivider />
          <Presets rollModifier={modifierAtom} />
        </Panel>
      </div>
    </div>
  )
}

function RollStats({ modifierAtom }: { modifierAtom: Atom<number> }) {
  const dice = useStoreValue(diceAtom)
  const mod = useStoreValue(modifierAtom)
  const { percentile, min, max, mean, total } = usePeek(
    (peek) => getRollStats(peek, modifierAtom, diceAtom),
    [modifierAtom, diceAtom],
  )

  return (
    <Fragment>
      <div style={{ height: '4px' }} />
      <PanelContent>
        <BulletGraph
          backgroundColor="#aaaabb"
          color={
            percentile !== percentile
              ? '#ff0000'
              : cssColor(bulletSpectrum(percentile))
          }
          max={max}
          min={0}
          value={total}
          targetValues={
            max === mod
              ? []
              : [
                  { value: min, label: 'min' },
                  { value: mean, label: 'mean' },
                  { value: max, label: 'max' },
                ]
          }
        />
      </PanelContent>
      <PanelContent>
        <BulletGraph
          backgroundColor="#aaaabb"
          color={
            percentile !== percentile
              ? '#ff0000'
              : cssColor(bulletSpectrum(percentile))
          }
          max={1}
          min={0}
          value={percentile !== percentile ? 0 : percentile}
          targetValues={
            dice.length < 3
              ? [{ value: 0.5, label: 'µ' }]
              : [
                  { value: 0.32, label: '-1σ' },
                  { value: 0.5, label: 'µ' },
                  { value: 0.68, label: '1σ' },
                ]
          }
        />
      </PanelContent>
    </Fragment>
  )
}

function createPresetFromRoll(diceFaces: number[], mod: number) {
  return presetsAtom.update((last) => [
    ...last,
    createAtom({
      name: '',
      mod,
      diceFaces,
      editing: true as boolean,
    }),
  ])
}

function RollSummary({ rollModifier }: { rollModifier: Atom<number> }) {
  const mod = useStoreValue(rollModifier)
  const diceFaces = usePeek(
    (peek) => peek(diceAtom).map((dieAtom) => peek(dieAtom).faces),
    [],
  )
  const dispatch = useDispatch()
  useSubscribe(
    (peek) =>
      void localStorage.setItem(
        'saved-roll-presets',
        JSON.stringify(peek(presetsAtom).map((preset) => peek(preset))),
      ),
    [presetsAtom],
  )

  return (
    <Fragment>
      <PanelContent className={justifyCenter}>
        <Button
          disabled={!diceFaces.length}
          danger={!!diceFaces.length}
          text="(C)lear"
          onClick={() => dispatch([clearDice(), rollModifier.set(0)])}
        />
        <Button
          disabled={!diceFaces.length}
          primary={!!diceFaces.length}
          text="(S)ave"
          onClick={() => dispatch(createPresetFromRoll(diceFaces, mod))}
        />
        <Button
          disabled={!diceFaces.length}
          primary={!!diceFaces.length}
          text="(R)eroll"
          onClick={() => dispatch(rerollDice)}
        />
      </PanelContent>
    </Fragment>
  )
}

const bulletSpectrum = createSpectrum([
  { value: 0.0, color: rgba(255, 0, 0) },
  { value: 0.5, color: rgba(255, 255, 0) },
  { value: 1.0, color: rgba(0, 255, 0) },
])

function ResponsivePage({
  modifierAtom,
  infoAtom,
  mobileAtom,
}: {
  modifierAtom: Atom<number>
  infoAtom: Atom<boolean>
  mobileAtom: Atom<'mobile' | 'desktop' | 'auto'>
}) {
  const mode = useStoreValue(mobileAtom)
  const renderedMobileApp = (
    <MobileApp
      modifierAtom={modifierAtom}
      infoAtom={infoAtom}
      mobileAtom={mobileAtom}
    />
  )
  const renderedDesktopApp = (
    <DesktopApp
      modifierAtom={modifierAtom}
      infoAtom={infoAtom}
      mobileAtom={mobileAtom}
    />
  )
  return (
    <Responsive>
      <Case
        minWidth={0}
        content={mode !== 'desktop' ? renderedMobileApp : renderedDesktopApp}
      />
      <Case
        minWidth={840}
        content={mode != 'mobile' ? renderedDesktopApp : renderedMobileApp}
      />
    </Responsive>
  )
}

export function App() {
  const [modifierAtom] = useState(createAtom(0 as number))
  const [infoAtom] = useState(createAtom(false as boolean))
  const [mobileAtom] = useState(
    createAtom('auto' as 'mobile' | 'desktop' | 'auto'),
  )

  return (
    <ResponsivePage
      modifierAtom={modifierAtom}
      infoAtom={infoAtom}
      mobileAtom={mobileAtom}
    />
  )
}

function Preset({
  atom,
  rollModifier,
}: {
  atom: Atom<{
    name: string
    diceFaces: number[]
    mod: number
    editing: boolean
  }>
  rollModifier: Atom<number>
}) {
  const { name, editing, mod, diceFaces } = useStoreValue(atom)
  const dispatch = useDispatch()

  const inputElem = useRef(undefined as undefined | HTMLInputElement)

  if (editing) {
    return (
      <div className={joinNames(justifyStart, row)}>
        <Button
          icon
          text={'✅'}
          onClick={() =>
            dispatch(atom.update((last) => ({ ...last, editing: !editing })))
          }
        />
        <input
          autoFocus
          ref={(ref) => ref && (inputElem.current = ref)}
          onKeyDown={(evt) => {
            if (evt.key === 'Enter') {
              dispatch(atom.update((last) => ({ ...last, editing: !editing })))
            }
          }}
          value={name}
          width={11}
          onChange={(evt) => {
            const val = evt.currentTarget.value
            if (val.length <= 11 && !/\s/.test(val)) {
              dispatch(
                atom.update((last) => ({
                  ...last,
                  name: evt.currentTarget.value,
                })),
              )
            }
          }}
        />
      </div>
    )
  } else {
    let text = ''
    if (mod === 0) {
      text = `${name}`
    } else if (mod > 0) {
      text = `${name} +${mod}`
    } else {
      text = `${name} ${mod}`
    }

    return (
      <div className={joinNames(justifyStart, row)}>
        <Button
          icon
          text={'❌'}
          onClick={() =>
            dispatch(
              presetsAtom.update((last) => last.filter((i) => i !== atom)),
            )
          }
        />
        <Button
          primary
          text={text}
          onClick={() =>
            dispatch([
              diceAtom.set(
                diceFaces.map((die) =>
                  createAtom({
                    faces: die,
                    roll: Math.floor(Math.random() * die) + 1,
                  }),
                ),
              ),
              rollModifier.set(mod),
            ])
          }
        />
      </div>
    )
  }
}

function Presets({ rollModifier }: { rollModifier: Atom<number> }) {
  const presets = useStoreValue(presetsAtom)
  return (
    <PanelContent className={joinNames(alignStart, column, flexGap)}>
      {presets.map((preset, i) => (
        <Memo key={i}>
          <Preset atom={preset} rollModifier={rollModifier} />
        </Memo>
      ))}
    </PanelContent>
  )
}

function RolledDice({ rollModifier }: { rollModifier: Atom<number> }) {
  const dice = useStoreValue(diceAtom)
  const mod = useStoreValue(rollModifier)
  const total = usePeek(
    (peek) =>
      peek(rollModifier) +
      peek(diceAtom).reduce((acc, die) => acc + peek(die).roll, 0),
    [diceAtom, rollModifier],
  )

  if (mod === 0 && !dice.length) {
    return null
  }

  return (
    <Fragment>
      <PanelContent className={joinNames(wrap, justifyCenter, alignCenter)}>
        {dice.map((dieAtom, idx) => (
          <Memo key={idx}>
            <RolledDie die={dieAtom} />
          </Memo>
        ))}
        {mod !== 0 ? <RollModifier mod={mod} /> : null}
      </PanelContent>
      <PanelContent className={justifyCenter}>
        <Text title className={totalText}>{`${total}`}</Text>
      </PanelContent>
    </Fragment>
  )
}

const desktopApp = style({
  position: 'relative',
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  backgroundColor: 'rgb(235, 239, 244)',
  padding: '8px',
  boxSizing: 'border-box',
})

const appPanel = style({
  maxWidth: '584px',
  minWidth: '584px',
})

const sidePanel = style({
  maxWidth: '236px',
  minWidth: '200px',
})

const mobileApp = style({
  alignItems: 'stretch',
  fontFamily: 'sans-serif',
  minHeight: '100vh',
  maxHeight: '100vh',
  padding: '12px',
  boxSizing: 'border-box',
})

const wrap = style({
  display: 'flex',
  flexWrap: 'wrap',
})

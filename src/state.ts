import { createReducer, arraylike } from '@dwalter/create-reducer'
import { createSelector } from '@dwalter/spider-hook'

interface Die {
  faces: number
  roll: number
}

const [getDice, diceActions] = createReducer('dice', [], {
  ...arraylike<Die>(),
  clear() {
    return []
  },
})

export function addDieRoll(faces: number) {
  const roll = Math.ceil(Math.random() * faces)
  return diceActions.add({ faces, roll })
}

export function rerollDie(index: number, die: Die) {
  const roll = Math.ceil(Math.random() * die.faces)
  return diceActions.update(index, { ...die, roll })
}

export const clearDice = diceActions.clear

export const getTotal = createSelector([getDice], dice => {
  let sum = 0
  for (let die of dice) {
    sum += die.roll
  }
  return sum
})

export { getDice }

import { createReducer, arraylike } from '@dwalter/create-reducer'
import { createSelector, tuple } from '@dwalter/spider-hook'
import { discreteUniformVariance, normal } from './stats'

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

export function incrementDie(index: number, die: Die) {
  return diceActions.update(index, { ...die, roll: (die.roll % die.faces) + 1 })
}

export const clearDice = diceActions.clear
export const removeDie = diceActions.delete

export const getTotal = createSelector([getDice], dice => {
  let sum = 0
  for (let die of dice) {
    sum += die.roll
  }
  return sum
})

export const getMaximum = createSelector([getDice], dice => {
  let max = 0
  for (let die of dice) {
    max += die.faces
  }
  return max
})

export const getRollPercentile = createSelector(
  tuple(getDice, getTotal),
  (dice, total) => {
    let variance = 0
    let mean = 0
    for (let die of dice) {
      variance += discreteUniformVariance(die.faces)
      mean += 0.5 + die.faces / 2
    }
    const standardDeviation = Math.sqrt(variance)
    const zScore = (total - mean) / standardDeviation

    return Math.floor(normal(zScore) * 100)
  },
)

export { getDice }

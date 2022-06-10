import { Atom, createAtom, createSelector, Peek } from './state-store'
import { discreteUniformVariance, normal, possibleRolls } from './stats'

export type Die = {
  faces: number
  roll: number
}

export const diceAtom = createAtom([] as Atom<Die>[])

export function addDieRoll(faces: number) {
  const roll = Math.ceil(Math.random() * faces)

  return diceAtom.update((last) => [...last, createAtom({ faces, roll })])
}

export function rerollDie(die: Atom<Die>) {
  return die.update((last) => {
    const roll = Math.ceil(Math.random() * last.faces)
    return { faces: last.faces, roll }
  })
}

export function incrementDie(die: Atom<Die>) {
  return die.update(({ roll, faces }) => {
    return {
      faces: faces,
      roll: (roll % faces) + 1,
    }
  })
}

export const clearDice = () => diceAtom.set([])

export const getTotal = createSelector((peek) => {
  const dice = peek(diceAtom)
  let sum = 0
  for (const die of dice) {
    sum += peek(die).roll
  }
  return sum
})

export function getRollStats(
  peek: Peek,
  modAtom: Atom<number>,
  // diceAtom: Atom<Atom<Die>[]>,
) {
  const mod = peek(modAtom)
  const dice = peek(diceAtom)
  const diceFaces: number[] = []
  let variance = 0
  let diceMean = 0
  let max = mod
  const min = mod + dice.length
  let diceSum = 0
  for (const die of dice) {
    const { roll, faces } = peek(die)
    max += faces
    variance += discreteUniformVariance(faces)
    diceMean += 0.5 + faces / 2
    diceSum += roll
    diceFaces.push(faces)
  }
  const standardDeviation = Math.sqrt(variance)
  const zScore = (diceSum - diceMean) / standardDeviation

  let percentile = 0
  if (diceFaces.reduce((a, i) => a * i, 1) > 400 * 400) {
    percentile = normal(zScore)
  } else {
    const rolls = possibleRolls(diceFaces)
    let otherCasesCount = 0
    let worseCasesCount = 0
    for (const [v, count] of rolls) {
      if (v < diceSum) {
        worseCasesCount += count
      }
      if (v !== diceSum) {
        otherCasesCount += count
      }
    }
    percentile = worseCasesCount / otherCasesCount
  }

  if (percentile !== percentile) {
    percentile = 0
  }

  return {
    min,
    max,
    mean: diceMean + mod,
    total: diceSum + mod,
    percentile,
  }
}

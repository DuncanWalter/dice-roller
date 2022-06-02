export function discreteUniformVariance(realizations: number) {
  return (realizations ** 2 - 1) / 12
}

let area = 0
let densities = [] as number[]

const cutoff = 5
const samples = 1000

for (let i = 0; i < samples; i++) {
  const density =
    Math.exp(-(((cutoff * i) / samples) ** 2 / 2)) / Math.sqrt(2 * Math.PI)
  densities.push((area += density))
}

export const normal = (z: number): number => {
  if (z < 0) {
    return 1 - normal(-z)
  }

  if (z >= cutoff) {
    return 1
  }

  const sample = Math.floor((z * samples) / cutoff)

  return 0.5 + (0.5 * densities[sample]) / area
}

type LL<T> = undefined | [T, LL<T>]
function* cross<T>(ts: T[][]): IterableIterator<LL<T>> {
  if (ts.length === 0) {
    return yield undefined
  }
  const [head, ...rest] = ts

  for (const tail of cross(rest)) {
    for (const item of head) {
      yield [item, tail]
    }
  }
}

export function possibleRolls(faces: number[]) {
  const rolls = cross(
    faces.map((n) => {
      const realizations = []
      for (let i = 0; i < n; i++) {
        realizations.push(i + 1)
      }
      return realizations
    }),
  )

  const result = new Map<number, number>()

  for (const roll of rolls) {
    let sum = 0
    let next = roll

    while (next) {
      sum += next[0]
      next = next[1]
    }

    result.set(sum, (result.get(sum) || 0) + 1)
  }

  return result
}

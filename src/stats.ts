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

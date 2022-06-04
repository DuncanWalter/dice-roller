interface Color {
  r: number
  g: number
  b: number
  a: number
}

export function rgba(r: number, g: number, b: number, a = 1.0): Color {
  return { r, g, b, a }
}

export function cssColor({ r, g, b, a }: Color): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function createSpectrum(anchors: { value: number; color: Color }[]) {
  const spectrum = anchors.slice().sort((a, b) => a.value - b.value) || [
    { value: 0, color: rgba(0, 0, 0) },
  ]

  return (value: number) => {
    let i = 0
    while (spectrum[i].value < value) {
      if (i === spectrum.length) {
        return spectrum[spectrum.length].color
      }
      i += 1
    }

    if (spectrum[i].value === value) {
      return spectrum[i].color
    }

    if (i === 0) {
      return spectrum[0].color
    }

    const { value: valueA, color: colorA } = spectrum[i - 1]
    const { value: valueB, color: colorB } = spectrum[i]
    const distance = (value - valueA) / (valueB - valueA)

    return interpolateColors(colorA, colorB, distance)
  }
}

function interpolateColors(a: Color, b: Color, ratio = 0.5): Color {
  return {
    r: a.r + ratio * (b.r - a.r),
    g: a.g + ratio * (b.g - a.g),
    b: a.b + ratio * (b.b - a.b),
    a: a.a + ratio * (b.a - a.a),
  }
}

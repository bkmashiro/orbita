// Rubik's cube state as permutation of 48 stickers (excluding centers)
// Sticker numbering:
//   Up: 0-7, Right: 8-15, Front: 16-23, Down: 24-31, Left: 32-39, Back: 40-47
// Each array index = position, value = which original sticker is there
// Face layout (clockwise from top-left, center excluded):
//   0 1 2
//   3   4
//   5 6 7
export type Perm = number[]

export const identity = (): Perm => Array.from({ length: 48 }, (_, i) => i)

// compose(a, b) means "first apply a, then apply b"
// position i gets the sticker that was at position a[b[i]]...
// Wait: if perm[i] = j means "sticker j is now at position i"
// Then compose(a, b)[i] = a[b[i]]
export const compose = (a: Perm, b: Perm): Perm => b.map(i => a[i])

export const inverse = (p: Perm): Perm => {
  const inv = new Array(48)
  p.forEach((val, idx) => { inv[val] = idx })
  return inv
}

export const power = (p: Perm, n: number): Perm => {
  if (n < 0) return power(inverse(p), -n)
  let result = identity()
  for (let i = 0; i < n; i++) result = compose(result, p)
  return result
}

export const order = (p: Perm): number => {
  let curr = [...p]
  for (let n = 1; n <= 1260; n++) {
    if (curr.every((val, idx) => val === idx)) return n
    curr = compose(curr, p)
  }
  return -1
}

export const toCycleNotation = (p: Perm): string => {
  const visited = new Set<number>()
  const cycles: number[][] = []
  for (let i = 0; i < p.length; i++) {
    if (visited.has(i) || p[i] === i) { visited.add(i); continue }
    const cycle: number[] = []
    let curr = i
    while (!visited.has(curr)) {
      visited.add(curr)
      cycle.push(curr)
      curr = p[curr]
    }
    if (cycle.length > 1) cycles.push(cycle)
  }
  if (cycles.length === 0) return 'e'
  return cycles.map(c => `(${c.join(' ')})`).join('')
}

export const isIdentity = (p: Perm): boolean => p.every((v, i) => v === i)

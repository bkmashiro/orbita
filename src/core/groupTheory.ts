import { type Perm, order, toCycleNotation, isIdentity } from './permutation'

export interface GroupProperties {
  order: number
  cycleNotation: string
  isSolved: boolean
  moveSequence: string[]
  numCycles: number
  shortDescription: string
}

export const analyzeState = (perm: Perm, moves: string[]): GroupProperties => {
  const ord = order(perm)
  const cycleStr = toCycleNotation(perm)
  const solved = isIdentity(perm)

  // Count cycles
  const numCycles = solved ? 0 : (cycleStr.match(/\(/g) || []).length

  let shortDescription: string
  if (solved) {
    shortDescription = 'Solved state (identity element)'
  } else if (ord === 2) {
    shortDescription = 'Involution — applying twice returns to start'
  } else if (ord <= 4) {
    shortDescription = `Order ${ord} — apply ${ord} times to return to start`
  } else {
    shortDescription = `Order ${ord} element of the Rubik's group`
  }

  return {
    order: ord,
    cycleNotation: cycleStr,
    isSolved: solved,
    moveSequence: moves,
    numCycles,
    shortDescription,
  }
}

// Format move sequence as LaTeX
export const toLatex = (moves: string[]): string => {
  if (moves.length === 0) return 'e'
  return moves.map(m => {
    if (m.endsWith("'")) return m.slice(0, -1) + "'"
    if (m.endsWith('2')) return m.slice(0, -1) + '^2'
    return m
  }).join(' \\cdot ')
}

// Famous algorithms
export const FAMOUS_ALGORITHMS: { name: string; moves: string[]; description: string }[] = [
  {
    name: 'Sexy Move',
    moves: ['R', 'U', "R'", "U'"],
    description: 'Order 6 — the most important pattern in speedcubing',
  },
  {
    name: 'Sune',
    moves: ['R', 'U', "R'", 'U', 'R', 'U2', "R'"],
    description: 'Corner orientation algorithm',
  },
  {
    name: 'T-Perm',
    moves: ['R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'"],
    description: 'Swaps two adjacent corners and two adjacent edges',
  },
  {
    name: 'Niklas',
    moves: ["R'", "F'", 'L', 'F', 'R', "F'", "L'", 'F'],
    description: 'Corner 3-cycle',
  },
  {
    name: 'U-Perm',
    moves: ['R2', 'U', 'R', 'U', "R'", "U'", "R'", "U'", "R'", 'U', "R'"],
    description: 'Cycles three edges in the U layer',
  },
]

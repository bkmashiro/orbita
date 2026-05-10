import { create } from 'zustand'
import { type Perm, identity, compose } from '../core/permutation'
import { MOVES } from '../core/moves'
import { analyzeState, type GroupProperties } from '../core/groupTheory'

// ── Animation config per move ─────────────────────────────────
// Angles verified against cycle definitions in moves.ts:
//   R: (UFR→DFR→DBR→UBR) = +π/2 around +x
//   L: (UFL→UBL→DBL→DFL) = -π/2 around +x
//   U: (UFL→UFR→UBR→UBL) via front→right = +π/2 around +y
//   D: (DFL→DBL→DBR→DFR) via front→left (from below) = -π/2 around +y
//   F: top→right = -π/2 around +z
//   B: top→left (from back) = +π/2 around +z

export type FaceKey = 'U' | 'D' | 'R' | 'L' | 'F' | 'B'

const MOVE_ANIM: Record<string, { face: FaceKey; axis: [number, number, number]; angle: number }> = {
  'R':  { face: 'R', axis: [1, 0, 0], angle:  Math.PI / 2 },
  "R'": { face: 'R', axis: [1, 0, 0], angle: -Math.PI / 2 },
  'R2': { face: 'R', axis: [1, 0, 0], angle:  Math.PI },
  'L':  { face: 'L', axis: [1, 0, 0], angle: -Math.PI / 2 },
  "L'": { face: 'L', axis: [1, 0, 0], angle:  Math.PI / 2 },
  'L2': { face: 'L', axis: [1, 0, 0], angle:  Math.PI },
  'U':  { face: 'U', axis: [0, 1, 0], angle:  Math.PI / 2 },
  "U'": { face: 'U', axis: [0, 1, 0], angle: -Math.PI / 2 },
  'U2': { face: 'U', axis: [0, 1, 0], angle:  Math.PI },
  'D':  { face: 'D', axis: [0, 1, 0], angle: -Math.PI / 2 },
  "D'": { face: 'D', axis: [0, 1, 0], angle:  Math.PI / 2 },
  'D2': { face: 'D', axis: [0, 1, 0], angle:  Math.PI },
  'F':  { face: 'F', axis: [0, 0, 1], angle: -Math.PI / 2 },
  "F'": { face: 'F', axis: [0, 0, 1], angle:  Math.PI / 2 },
  'F2': { face: 'F', axis: [0, 0, 1], angle:  Math.PI },
  'B':  { face: 'B', axis: [0, 0, 1], angle:  Math.PI / 2 },
  "B'": { face: 'B', axis: [0, 0, 1], angle: -Math.PI / 2 },
  'B2': { face: 'B', axis: [0, 0, 1], angle:  Math.PI },
}

const INVERSE_MOVE: Record<string, string> = {
  "R": "R'", "R'": "R", "R2": "R2",
  "U": "U'", "U'": "U", "U2": "U2",
  "F": "F'", "F'": "F", "F2": "F2",
  "B": "B'", "B'": "B", "B2": "B2",
  "L": "L'", "L'": "L", "L2": "L2",
  "D": "D'", "D'": "D", "D2": "D2",
}

export interface PendingAnimation {
  face: FaceKey
  axis: [number, number, number]
  angle: number
  fromPerm: Perm
  startTime: number
  duration: number
}

const ANIM_MS = { slow: 550, normal: 280, fast: 120 }

interface CubeState {
  perm: Perm
  moveHistory: string[]
  hoveredMove: string | null
  hoveredFace: string | null
  animationSpeed: 'slow' | 'normal' | 'fast'
  groupProps: GroupProperties
  pendingAnimation: PendingAnimation | null

  applyMove: (move: string) => void
  applySequence: (moves: string[]) => void
  undoMove: () => void
  resetCube: () => void
  goToStep: (step: number) => void
  setHoveredMove: (move: string | null) => void
  setHoveredFace: (face: string | null) => void
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void
  clearAnimation: () => void
  scramble: () => void
  getSolution: () => string[]
}

export const useCubeStore = create<CubeState>((set, get) => ({
  perm: identity(),
  moveHistory: [],
  hoveredMove: null,
  hoveredFace: null,
  animationSpeed: 'normal',
  groupProps: analyzeState(identity(), []),
  pendingAnimation: null,

  applyMove: (move) => set(s => {
    if (!MOVES[move]) return s
    const fromPerm = s.perm
    const newPerm = compose(s.perm, MOVES[move])
    const newHistory = [...s.moveHistory, move]
    const cfg = MOVE_ANIM[move]
    // Skip new animation if one is already running (rapid clicking)
    const anim: PendingAnimation | null = (cfg && !s.pendingAnimation) ? {
      face: cfg.face,
      axis: cfg.axis,
      angle: cfg.angle,
      fromPerm,
      startTime: Date.now(),
      duration: ANIM_MS[s.animationSpeed],
    } : null
    return {
      perm: newPerm,
      moveHistory: newHistory,
      groupProps: analyzeState(newPerm, newHistory),
      pendingAnimation: anim,
    }
  }),

  applySequence: (moves) => set(s => {
    let perm = s.perm
    for (const m of moves) {
      if (MOVES[m]) perm = compose(perm, MOVES[m])
    }
    const newHistory = [...s.moveHistory, ...moves.filter(m => MOVES[m])]
    return {
      perm,
      moveHistory: newHistory,
      groupProps: analyzeState(perm, newHistory),
      pendingAnimation: null,
    }
  }),

  undoMove: () => set(s => {
    if (s.moveHistory.length === 0) return s
    const newHistory = s.moveHistory.slice(0, -1)
    let perm = identity()
    for (const m of newHistory) perm = compose(perm, MOVES[m])
    return { perm, moveHistory: newHistory, groupProps: analyzeState(perm, newHistory), pendingAnimation: null }
  }),

  resetCube: () => set({
    perm: identity(),
    moveHistory: [],
    groupProps: analyzeState(identity(), []),
    pendingAnimation: null,
  }),

  goToStep: (step) => set(s => {
    const history = s.moveHistory.slice(0, step)
    let perm = identity()
    for (const m of history) perm = compose(perm, MOVES[m])
    return { perm, moveHistory: history, groupProps: analyzeState(perm, history), pendingAnimation: null }
  }),

  clearAnimation: () => set({ pendingAnimation: null }),

  scramble: () => {
    const moveNames = Object.keys(MOVES)
    const seq: string[] = []
    let lastBase = ''
    for (let i = 0; i < 20; i++) {
      const avail = moveNames.filter(m => m[0] !== lastBase)
      const m = avail[Math.floor(Math.random() * avail.length)]
      seq.push(m)
      lastBase = m[0]
    }
    let perm = identity()
    for (const m of seq) perm = compose(perm, MOVES[m])
    set({ perm, moveHistory: seq, groupProps: analyzeState(perm, seq), pendingAnimation: null })
  },

  getSolution: () => {
    const h = get().moveHistory
    return [...h].reverse().map(m => INVERSE_MOVE[m] ?? m)
  },

  setHoveredMove: (move) => set({ hoveredMove: move }),
  setHoveredFace: (face) => set({ hoveredFace: face }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
}))

import { create } from 'zustand'
import { type Perm, identity, compose } from '../core/permutation'
import { MOVES } from '../core/moves'
import { analyzeState, type GroupProperties } from '../core/groupTheory'

interface CubeState {
  // Core state
  perm: Perm
  moveHistory: string[]

  // UI state
  hoveredMove: string | null
  hoveredFace: string | null
  isAnimating: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'

  // Computed
  groupProps: GroupProperties

  // Actions
  applyMove: (move: string) => void
  applySequence: (moves: string[]) => void
  undoMove: () => void
  resetCube: () => void
  goToStep: (step: number) => void
  setHoveredMove: (move: string | null) => void
  setHoveredFace: (face: string | null) => void
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void
}

export const useCubeStore = create<CubeState>((set, _get) => ({
  perm: identity(),
  moveHistory: [],
  hoveredMove: null,
  hoveredFace: null,
  isAnimating: false,
  animationSpeed: 'normal',
  groupProps: analyzeState(identity(), []),

  applyMove: (move) => set(s => {
    if (!MOVES[move]) return s
    const newPerm = compose(s.perm, MOVES[move])
    const newHistory = [...s.moveHistory, move]
    return {
      perm: newPerm,
      moveHistory: newHistory,
      groupProps: analyzeState(newPerm, newHistory),
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
    }
  }),

  undoMove: () => set(s => {
    if (s.moveHistory.length === 0) return s
    const newHistory = s.moveHistory.slice(0, -1)
    let perm = identity()
    for (const m of newHistory) perm = compose(perm, MOVES[m])
    return { perm, moveHistory: newHistory, groupProps: analyzeState(perm, newHistory) }
  }),

  resetCube: () => set({
    perm: identity(),
    moveHistory: [],
    groupProps: analyzeState(identity(), []),
  }),

  goToStep: (step) => set(s => {
    const history = s.moveHistory.slice(0, step)
    let perm = identity()
    for (const m of history) perm = compose(perm, MOVES[m])
    return { perm, moveHistory: history, groupProps: analyzeState(perm, history) }
  }),

  setHoveredMove: (move) => set({ hoveredMove: move }),
  setHoveredFace: (face) => set({ hoveredFace: face }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
}))

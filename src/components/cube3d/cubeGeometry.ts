/**
 * Maps the permutation state to visual cubie colors.
 *
 * Sticker scheme:
 *   U(0-7), R(8-15), F(16-23), D(24-31), L(32-39), B(40-47)
 *
 *   U: 0=UBL,1=UB,2=UBR,3=UL,4=UR,5=UFL,6=UF,7=UFR
 *   R: 8=RUB,9=RU,10=RUF,11=RB,12=RF,13=RDB,14=RD,15=RDF
 *   F: 16=FUL,17=FU,18=FUR,19=FL,20=FR,21=FDL,22=FD,23=FDR
 *   D: 24=DFL,25=DF,26=DFR,27=DL,28=DR,29=DBL,30=DB,31=DBR
 *   L: 32=LUF,33=LU,34=LUB,35=LF,36=LB,37=LDF,38=LD,39=LDB
 *   B: 40=BUR,41=BU,42=BUL,43=BR,44=BL,45=BDR,46=BD,47=BDL
 */

export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R'

// Original (solved) colors for each face
export const FACE_COLORS: Record<FaceName, string> = {
  U: '#FFFFFF', // white
  R: '#FF6B35', // orange
  F: '#2ECC71', // green
  D: '#F1C40F', // yellow
  L: '#E74C3C', // red
  B: '#3498DB', // blue
}

// Which face (in solved state) does a sticker index belong to?
export const stickerFace = (idx: number): FaceName => {
  if (idx < 8)  return 'U'
  if (idx < 16) return 'R'
  if (idx < 24) return 'F'
  if (idx < 32) return 'D'
  if (idx < 40) return 'L'
  return 'B'
}

interface CubieDef {
  pos: [number, number, number]
  stickers: Partial<Record<FaceName, number>>
}

/**
 * All 20 non-center cubies (8 corners + 12 edges).
 * stickers maps each visible face to its sticker position index.
 */
const CUBIE_DEFS: CubieDef[] = [
  // ── U-layer (y=+1) ──────────────────────────────────────────────────
  { pos: [-1,  1, -1], stickers: { U: 0,  L: 34, B: 42 } },  // UBL corner
  { pos: [ 0,  1, -1], stickers: { U: 1,  B: 41 } },           // UB edge
  { pos: [ 1,  1, -1], stickers: { U: 2,  R: 8,  B: 40 } },  // UBR corner
  { pos: [-1,  1,  0], stickers: { U: 3,  L: 33 } },           // UL edge
  { pos: [ 1,  1,  0], stickers: { U: 4,  R: 9  } },           // UR edge
  { pos: [-1,  1,  1], stickers: { U: 5,  L: 32, F: 16 } },  // UFL corner
  { pos: [ 0,  1,  1], stickers: { U: 6,  F: 17 } },           // UF edge
  { pos: [ 1,  1,  1], stickers: { U: 7,  R: 10, F: 18 } },  // UFR corner

  // ── M-layer (y=0) ───────────────────────────────────────────────────
  { pos: [-1,  0, -1], stickers: { L: 36, B: 44 } },           // LB edge
  { pos: [ 1,  0, -1], stickers: { R: 11, B: 43 } },           // RB edge
  { pos: [-1,  0,  1], stickers: { L: 35, F: 19 } },           // LF edge
  { pos: [ 1,  0,  1], stickers: { R: 12, F: 20 } },           // RF edge

  // ── D-layer (y=-1) ──────────────────────────────────────────────────
  { pos: [-1, -1,  1], stickers: { D: 24, L: 37, F: 21 } },  // DFL corner
  { pos: [ 0, -1,  1], stickers: { D: 25, F: 22 } },           // DF edge
  { pos: [ 1, -1,  1], stickers: { D: 26, R: 15, F: 23 } },  // DFR corner
  { pos: [-1, -1,  0], stickers: { D: 27, L: 38 } },           // DL edge
  { pos: [ 1, -1,  0], stickers: { D: 28, R: 14 } },           // DR edge
  { pos: [-1, -1, -1], stickers: { D: 29, L: 39, B: 47 } },  // DBL corner
  { pos: [ 0, -1, -1], stickers: { D: 30, B: 46 } },           // DB edge
  { pos: [ 1, -1, -1], stickers: { D: 31, R: 13, B: 45 } },  // DBR corner
]

export interface CubieRenderData {
  pos: [number, number, number]
  colors: Partial<Record<FaceName, string>>
  isHighlighted: boolean
}

/**
 * Build render data from permutation state.
 * perm[i] = j means: the sticker originally at position j is now at position i.
 * So the color at position i = FACE_COLORS[stickerFace(perm[i])]
 */
export function buildCubieRenderData(
  perm: number[],
  hoveredFace: string | null
): CubieRenderData[] {
  return CUBIE_DEFS.map(cubie => {
    const colors: Partial<Record<FaceName, string>> = {}

    for (const [faceStr, stickerIdx] of Object.entries(cubie.stickers)) {
      const face = faceStr as FaceName
      const originalSticker = perm[stickerIdx]
      colors[face] = FACE_COLORS[stickerFace(originalSticker)]
    }

    const isHighlighted =
      hoveredFace !== null &&
      Object.keys(cubie.stickers).includes(hoveredFace)

    return { pos: cubie.pos, colors, isHighlighted }
  })
}

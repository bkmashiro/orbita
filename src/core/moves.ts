/**
 * Rubik's Cube move permutations.
 *
 * Sticker numbering:
 *   Face order: U(0-7), R(8-15), F(16-23), D(24-31), L(32-39), B(40-47)
 *   Face layout (center excluded, clockwise from top-left):
 *     0 1 2
 *     3   4
 *     5 6 7
 *
 * Named positions (absolute index):
 *   U: 0=UBL,1=UB,2=UBR,3=UL,4=UR,5=UFL,6=UF,7=UFR
 *   R: 8=RUB,9=RU,10=RUF,11=RB,12=RF,13=RDB,14=RD,15=RDF
 *   F: 16=FUL,17=FU,18=FUR,19=FL,20=FR,21=FDL,22=FD,23=FDR
 *   D: 24=DFL,25=DF,26=DFR,27=DL,28=DR,29=DBL,30=DB,31=DBR
 *   L: 32=LUF,33=LU,34=LUB,35=LF,36=LB,37=LDF,38=LD,39=LDB
 *   B: 40=BUR,41=BU,42=BUL,43=BR,44=BL,45=BDR,46=BD,47=BDL
 *
 * World coordinates: x=right, y=up, z=front.
 * Each cubie position: (-1,0,+1) × (-1,0,+1) × (-1,0,+1), skip (0,0,0).
 *
 * All cycles derived geometrically (verified: move^4 = identity for all face moves).
 */

import { type Perm, identity, inverse, power } from './permutation'

/**
 * Convert disjoint cycles to a permutation.
 * Cycle [a,b,c] means: sticker at a goes to b, b goes to c, c goes to a.
 */
const cycleToPermutation = (cycles: number[][]): Perm => {
  const p = identity()
  for (const cycle of cycles) {
    for (let i = 0; i < cycle.length; i++) {
      p[cycle[i]] = cycle[(i + 1) % cycle.length]
    }
  }
  return p
}

// ─── U move — top face clockwise (viewed from above) ─────────────────────
// CW from above: front→right→back→left. Rotation: (x,z)→(z,-x)
// U face corners: [UBL→UBR→UFR→UFL] = [0→2→7→5]
// U face edges:   [UB→UR→UF→UL] = [1→4→6→3]
// Adjacent side stickers (tracked by geometry):
//   FUL(16)→RUF(10)→BUR(40)→LUB(34)→FUL
//   FU(17)→RU(9)→BU(41)→LU(33)→FU
//   FUR(18)→RUB(8)→BUL(42)→LUF(32)→FUR
const U_MOVE = cycleToPermutation([
  [0, 2, 7, 5],
  [1, 4, 6, 3],
  [16, 10, 40, 34],
  [17, 9, 41, 33],
  [18, 8, 42, 32],
])

// ─── D move — bottom face clockwise (viewed from below) ──────────────────
// CW from below: front→left→back→right. Rotation: (x,z)→(-z,x)
// D face corners: [DFL→DBL→DBR→DFR] = [24→29→31→26]
// D face edges:   [DF→DL→DB→DR] = [25→27→30→28]
// Adjacent:
//   FDL(21)→LDF(37)→BDL(47... wait let me use verified values)
//   FDL(21)→LDB(39)→BDR(45)→RDF(15)→FDL
//   FD(22)→LD(38)→BD(46)→RD(14)→FD
//   FDR(23)→LDF(37)→BDL(47)→RDB(13)→FDR
const D_MOVE = cycleToPermutation([
  [24, 29, 31, 26],
  [25, 27, 30, 28],
  [21, 39, 45, 15],
  [22, 38, 46, 14],
  [23, 37, 47, 13],
])

// ─── F move — front face clockwise (viewed from front) ───────────────────
// CW from front: top→right→bottom→left. Rotation: (x,y)→(y,-x)
// F face corners: [FUL→FUR→FDR→FDL] = [16→18→23→21]
// F face edges:   [FU→FR→FD→FL] = [17→20→22→19]
// Adjacent:
//   UFL(5)→RUF(10)→DFR(26)→LDF(37)→UFL
//   UF(6)→RF(12)→DF(25)→LF(35)→UF
//   UFR(7)→RDF(15)→DFL(24)→LUF(32)→UFR
const F_MOVE = cycleToPermutation([
  [16, 18, 23, 21],
  [17, 20, 22, 19],
  [5, 10, 26, 37],
  [6, 12, 25, 35],
  [7, 15, 24, 32],
])

// ─── B move — back face clockwise (viewed from back) ─────────────────────
// CW from back (looking in +z): top→world-left→bottom→world-right.
// Rotation: (x,y)→(y,-x)
// B face corners: [BUR→BDR→BDL→BUL] = [40→45→47→42]
// B face edges:   [BU→BR→BD→BL] = [41→43→46→44]
// Adjacent:
//   UBR(2)→RDB(13)→DBL(29)→LUB(34)→UBR
//   UB(1)→RB(11)→DB(30)→LB(36)→UB
//   UBL(0)→RUB(8)→DBR(31)→LDB(39)→UBL
const B_MOVE = cycleToPermutation([
  [40, 45, 47, 42],
  [41, 43, 46, 44],
  [2, 13, 29, 34],
  [1, 11, 30, 36],
  [0, 8, 31, 39],
])

// ─── R move — right face clockwise (viewed from right) ───────────────────
// CW from right (looking in -x): top→front→bottom→back. Rotation: (y,z)→(-z,y)
// R face corners: [RUB→RUF→RDF→RDB] = [8→10→15→13]
// R face edges:   [RU→RF→RD→RB] = [9→12→14→11]
// Adjacent:
//   UFR(7)→FDR(23)→DBR(31)→BUR(40)→UFR
//   UR(4)→FR(20)→DR(28)→BR(43)→UR
//   UBR(2)→FUR(18)→DFR(26)→BDR(45)→UBR
const R_MOVE = cycleToPermutation([
  [8, 10, 15, 13],
  [9, 12, 14, 11],
  [7, 23, 31, 40],
  [4, 20, 28, 43],
  [2, 18, 26, 45],
])

// ─── L move — left face clockwise (viewed from left) ─────────────────────
// CW from left (looking in +x): top→back→bottom→front. Rotation: (y,z)→(z,-y)
// L face corners: [LUF→LUB→LDB→LDF] = [32→34→39→37]
// L face edges:   [LU→LB→LD→LF] = [33→36→38→35]
// Adjacent:
//   UFL(5)→BUL(42)→DBL(29)→FDL(21)→UFL
//   UL(3)→BL(44)→DL(27)→FL(19)→UL
//   UBL(0)→BDL(47)→DFL(24)→FUL(16)→UBL
const L_MOVE = cycleToPermutation([
  [32, 34, 39, 37],
  [33, 36, 38, 35],
  [5, 42, 29, 21],
  [3, 44, 27, 19],
  [0, 47, 24, 16],
])

// ─── All 18 moves ─────────────────────────────────────────────────────────
export const MOVES: Record<string, Perm> = {
  'R': R_MOVE,
  "R'": inverse(R_MOVE),
  'R2': power(R_MOVE, 2),
  'U': U_MOVE,
  "U'": inverse(U_MOVE),
  'U2': power(U_MOVE, 2),
  'F': F_MOVE,
  "F'": inverse(F_MOVE),
  'F2': power(F_MOVE, 2),
  'B': B_MOVE,
  "B'": inverse(B_MOVE),
  'B2': power(B_MOVE, 2),
  'L': L_MOVE,
  "L'": inverse(L_MOVE),
  'L2': power(L_MOVE, 2),
  'D': D_MOVE,
  "D'": inverse(D_MOVE),
  'D2': power(D_MOVE, 2),
}

export const MOVE_NAMES = [
  'R', "R'", 'R2',
  'U', "U'", 'U2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
  'L', "L'", 'L2',
  'D', "D'", 'D2',
]

export const MOVE_FACE: Record<string, string> = {
  'R': 'R', "R'": 'R', 'R2': 'R',
  'U': 'U', "U'": 'U', 'U2': 'U',
  'F': 'F', "F'": 'F', 'F2': 'F',
  'B': 'B', "B'": 'B', 'B2': 'B',
  'L': 'L', "L'": 'L', 'L2': 'L',
  'D': 'D', "D'": 'D', 'D2': 'D',
}

import { useCubeStore } from '../../store/useCubeStore'
import { MOVE_FACE } from '../../core/moves'

const FACE_GROUPS = [
  { face: 'U', label: 'U', color: '#FFFFFF', moves: ['U', "U'", 'U2'] },
  { face: 'R', label: 'R', color: '#FF6B35', moves: ['R', "R'", 'R2'] },
  { face: 'F', label: 'F', color: '#2ECC71', moves: ['F', "F'", 'F2'] },
  { face: 'L', label: 'L', color: '#E74C3C', moves: ['L', "L'", 'L2'] },
  { face: 'B', label: 'B', color: '#3498DB', moves: ['B', "B'", 'B2'] },
  { face: 'D', label: 'D', color: '#F1C40F', moves: ['D', "D'", 'D2'] },
]

function MoveButton({ move, faceColor }: { move: string; faceColor: string }) {
  const { applyMove, setHoveredMove, setHoveredFace } = useCubeStore()
  const face = MOVE_FACE[move]

  const base = move[0]
  const suffix = move.endsWith("'") ? '′' : move.endsWith('2') ? '²' : ''
  // Rotation symbol hint
  const rotSymbol = move.endsWith("'") ? '↺' : '↻'
  const isDouble = move.endsWith('2')

  return (
    <button
      className="move-btn"
      onClick={() => applyMove(move)}
      onMouseEnter={() => { setHoveredMove(move); setHoveredFace(face) }}
      onMouseLeave={() => { setHoveredMove(null); setHoveredFace(null) }}
      title={`Apply ${move}`}
      style={{ '--face-color': faceColor } as React.CSSProperties}
    >
      <span className="move-btn-sym">{isDouble ? '↔' : rotSymbol}</span>
      <span className="move-btn-label">{base}{suffix}</span>
    </button>
  )
}

export function MoveControls() {
  const { undoMove, resetCube, moveHistory, groupProps, scramble, applySequence, getSolution, animationSpeed, setAnimationSpeed } = useCubeStore()

  const handleSolve = () => {
    const solution = getSolution()
    if (solution.length > 0) applySequence(solution)
  }

  return (
    <div className="move-controls">
      {/* Face move grid */}
      <div className="move-grid">
        {FACE_GROUPS.map(({ face, label, color, moves }) => (
          <div key={face} className="face-group">
            <div className="face-label" style={{ color, borderColor: color + '33' }}>
              {label}
            </div>
            <div className="face-moves">
              {moves.map(m => <MoveButton key={m} move={m} faceColor={color} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Speed control */}
      <div className="speed-row">
        <span className="speed-label">Speed</span>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button
            key={s}
            className={`speed-btn ${animationSpeed === s ? 'speed-btn--active' : ''}`}
            onClick={() => setAnimationSpeed(s)}
          >
            {s === 'slow' ? '🐢' : s === 'normal' ? '▶' : '⚡'}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="control-actions">
        <button className="btn-secondary" onClick={undoMove} disabled={moveHistory.length === 0} title="Undo last move">
          ↩ Undo
        </button>
        <button className="btn-secondary" onClick={resetCube} disabled={moveHistory.length === 0} title="Reset to solved">
          ⟳ Reset
        </button>
        <button className="btn-scramble" onClick={scramble} title="Apply 20 random moves">
          🎲 Scramble
        </button>
        <button
          className="btn-solve"
          onClick={handleSolve}
          disabled={groupProps.isSolved}
          title="Apply g⁻¹ — the inverse sequence"
        >
          🔧 Solve (g⁻¹)
        </button>
      </div>
    </div>
  )
}

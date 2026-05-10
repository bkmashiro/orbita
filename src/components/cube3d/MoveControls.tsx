import { useCubeStore } from '../../store/useCubeStore'
import { MOVE_FACE } from '../../core/moves'

const FACE_BUTTON_GROUPS = [
  { face: 'U', label: 'U', color: '#FFFFFF', moves: ['U', "U'", 'U2'] },
  { face: 'D', label: 'D', color: '#F1C40F', moves: ['D', "D'", 'D2'] },
  { face: 'F', label: 'F', color: '#2ECC71', moves: ['F', "F'", 'F2'] },
  { face: 'B', label: 'B', color: '#3498DB', moves: ['B', "B'", 'B2'] },
  { face: 'R', label: 'R', color: '#FF6B35', moves: ['R', "R'", 'R2'] },
  { face: 'L', label: 'L', color: '#E74C3C', moves: ['L', "L'", 'L2'] },
]

function MoveButton({ move }: { move: string }) {
  const { applyMove, setHoveredMove, setHoveredFace } = useCubeStore()
  const face = MOVE_FACE[move]

  const displayLabel = move.endsWith("'") ? move[0] + "'" : move.endsWith('2') ? move[0] + '²' : move

  return (
    <button
      className="move-btn"
      onClick={() => applyMove(move)}
      onMouseEnter={() => { setHoveredMove(move); setHoveredFace(face) }}
      onMouseLeave={() => { setHoveredMove(null); setHoveredFace(null) }}
      title={`Apply ${move}`}
    >
      {displayLabel}
    </button>
  )
}

export function MoveControls() {
  const { undoMove, resetCube, moveHistory } = useCubeStore()

  return (
    <div className="move-controls">
      <div className="move-grid">
        {FACE_BUTTON_GROUPS.map(({ face, label, color, moves }) => (
          <div key={face} className="face-group">
            <div
              className="face-label"
              style={{ color, borderColor: color + '40' }}
            >
              {label}
            </div>
            <div className="face-moves">
              {moves.map(m => <MoveButton key={m} move={m} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="control-actions">
        <button
          className="btn-secondary"
          onClick={undoMove}
          disabled={moveHistory.length === 0}
          title="Undo last move"
        >
          ↩ Undo
        </button>
        <button
          className="btn-secondary"
          onClick={resetCube}
          disabled={moveHistory.length === 0}
          title="Reset to solved state"
        >
          ⟳ Reset
        </button>
      </div>
    </div>
  )
}

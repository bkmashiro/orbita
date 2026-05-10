import { useRef, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useCubeStore } from '../../store/useCubeStore'
import { MOVE_FACE } from '../../core/moves'

function renderKatex(str: string): string {
  try {
    return katex.renderToString(str, { throwOnError: false, output: 'html' })
  } catch {
    return str
  }
}

function moveToLatex(move: string): string {
  if (move.endsWith("'")) return `${move[0]}'`
  if (move.endsWith('2')) return `${move[0]}^2`
  return move
}

function MoveToken({ move, index }: { move: string; index: number }) {
  const { setHoveredMove, setHoveredFace, hoveredMove } = useCubeStore()
  const face = MOVE_FACE[move]
  const isHovered = hoveredMove === move

  const latexStr = moveToLatex(move)
  const html = renderKatex(latexStr)

  return (
    <>
      {index > 0 && <span className="move-dot">·</span>}
      <span
        className={`move-token ${isHovered ? 'move-token--hovered' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
        onMouseEnter={() => {
          setHoveredMove(move)
          setHoveredFace(face)
        }}
        onMouseLeave={() => {
          setHoveredMove(null)
          setHoveredFace(null)
        }}
        title={`${move} — click the move buttons to apply`}
        data-face={face}
      />
    </>
  )
}

function PropertyRow({
  label,
  latexVal,
  explanation,
}: {
  label: string
  latexVal: string
  explanation: string
}) {
  const html = renderKatex(latexVal)
  return (
    <div className="property-row" title={explanation}>
      <span className="property-label">{label}</span>
      <span
        className="property-value"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <span className="property-hint">{explanation}</span>
    </div>
  )
}

export function FormulaPanel() {
  const { moveHistory, groupProps } = useCubeStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to end when new moves added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [moveHistory.length])

  const orderLatex = groupProps.isSolved
    ? `\\text{ord}(g) = 1`
    : `\\text{ord}(g) = ${groupProps.order}`

  // Truncate cycle notation for display (it can be very long)
  const cycleDisplay = groupProps.cycleNotation.length > 60
    ? groupProps.cycleNotation.slice(0, 57) + '...'
    : groupProps.cycleNotation

  return (
    <div className="formula-panel">
      <div className="formula-header">
        <h3 className="formula-title">Group Element</h3>
        <span className="formula-subtitle">
          {groupProps.isSolved ? 'Identity (solved)' : `${moveHistory.length} move${moveHistory.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Move sequence */}
      <div className="formula-sequence-wrapper">
        <div className="formula-label">g =</div>
        <div className="formula-sequence" ref={scrollRef}>
          {moveHistory.length === 0 ? (
            <span
              className="move-identity"
              dangerouslySetInnerHTML={{ __html: renderKatex('e') }}
            />
          ) : (
            moveHistory.map((m, i) => (
              <MoveToken key={i} move={m} index={i} />
            ))
          )}
        </div>
      </div>

      {/* Group properties */}
      <div className="group-properties">
        <PropertyRow
          label="Order"
          latexVal={orderLatex}
          explanation={
            groupProps.isSolved
              ? 'Identity element — applying this does nothing'
              : `Apply this sequence ${groupProps.order} times to return to solved state`
          }
        />
        <div className="property-row property-row--cycles">
          <span className="property-label">Cycles</span>
          <span className="property-value property-value--mono">
            {groupProps.isSolved ? 'e' : cycleDisplay}
          </span>
          <span className="property-hint">
            Disjoint cycle decomposition of the permutation
          </span>
        </div>
        {!groupProps.isSolved && (
          <div className="property-row">
            <span className="property-label">Note</span>
            <span className="property-value property-value--description">
              {groupProps.shortDescription}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

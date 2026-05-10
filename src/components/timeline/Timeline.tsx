import { useRef } from 'react'
import { useCubeStore } from '../../store/useCubeStore'

export function Timeline() {
  const { moveHistory, goToStep, resetCube } = useCubeStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (moveHistory.length === 0) {
    return (
      <div className="timeline timeline--empty">
        <span className="timeline-empty-msg">
          Apply moves to build a sequence — then drag the timeline to replay
        </span>
      </div>
    )
  }

  return (
    <div className="timeline">
      <div className="timeline-label">Timeline</div>
      <div className="timeline-track" ref={scrollRef}>
        <button
          className="timeline-step timeline-step--start"
          onClick={() => goToStep(0)}
          title="Go to solved state"
        >
          e
        </button>
        {moveHistory.map((move, i) => {
          const displayMove = move.endsWith("'")
            ? move[0] + "'"
            : move.endsWith('2')
            ? move[0] + '²'
            : move
          return (
            <button
              key={i}
              className="timeline-step"
              onClick={() => goToStep(i + 1)}
              title={`Go to step ${i + 1}: after ${move}`}
            >
              <span className="timeline-move">{displayMove}</span>
              <span className="timeline-index">{i + 1}</span>
            </button>
          )
        })}
      </div>
      <button className="timeline-clear" onClick={resetCube} title="Clear all moves">
        Clear
      </button>
    </div>
  )
}

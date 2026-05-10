import { RubiksCubeScene } from '../components/cube3d/RubiksCube'
import { MoveControls } from '../components/cube3d/MoveControls'
import { FormulaPanel } from '../components/formula/FormulaPanel'
import { ExplanationPanel } from '../components/explanation/ExplanationPanel'
import { Timeline } from '../components/timeline/Timeline'
import { useCubeStore } from '../store/useCubeStore'

function Header() {
  const { groupProps } = useCubeStore()
  return (
    <header className="site-header">
      <div className="header-brand">
        <img src="/favicon.svg" alt="Orbita" style={{width: 28, height: 28}} />
        <span className="brand-title">Orbita</span>
      </div>
      <div className="header-status">
        {groupProps.isSolved ? (
          <span className="status-solved">Solved</span>
        ) : (
          <span className="status-unsolved">
            ord(g) = {groupProps.order}
          </span>
        )}
      </div>
      <nav className="header-nav">
        <a href="#" className="nav-link nav-link--active">Explore</a>
      </nav>
    </header>
  )
}

export function Explore() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="explore-layout">
        {/* Left panel: 3D cube + controls */}
        <section className="cube-panel glass-panel">
          <div className="cube-viewport">
            <RubiksCubeScene />
          </div>
          <MoveControls />
        </section>

        {/* Right panel: formula + group theory + explanations */}
        <section className="theory-panel">
          <div className="glass-panel">
            <FormulaPanel />
          </div>
          <div className="glass-panel">
            <ExplanationPanel />
          </div>
        </section>

        {/* Bottom: timeline */}
        <section className="timeline-section glass-panel">
          <Timeline />
        </section>
      </main>
    </div>
  )
}

import { useCubeStore } from '../../store/useCubeStore'
import { FAMOUS_ALGORITHMS } from '../../core/groupTheory'
import { motion, AnimatePresence } from 'framer-motion'

interface Concept {
  term: string
  title: string
  body: string
  latex?: string
}

const CONCEPTS: Concept[] = [
  {
    term: 'group',
    title: 'What is a Group?',
    body: 'A group is a set with an operation satisfying four axioms: closure (combining two elements gives another element in the set), associativity, identity (there\'s a "do nothing" element), and inverses (every move can be undone).',
  },
  {
    term: 'permutation',
    title: 'Permutations',
    body: 'Each Rubik\'s cube state is a permutation of 48 stickers (8 per face × 6 faces, excluding centers). Two states are multiplied by composing their permutations.',
  },
  {
    term: 'order',
    title: 'Order of an Element',
    body: 'The order of a group element g is the smallest positive integer n such that gⁿ = e (identity). For the Rubik\'s cube, the maximum order is 1260 — meaning some sequences need to be repeated 1260 times to return to solved!',
    latex: 'g^n = e',
  },
  {
    term: 'cycle',
    title: 'Cycle Notation',
    body: 'A permutation decomposes uniquely into disjoint cycles. A cycle (a b c) means: a goes to b\'s position, b goes to c\'s position, c goes back to a\'s position.',
    latex: '(a\\;b\\;c)',
  },
  {
    term: 'commutator',
    title: 'Commutators',
    body: 'The commutator [A,B] = A B A⁻¹ B⁻¹ measures how much A and B fail to commute. If they commute, [A,B] = e. Commutators are the backbone of advanced Rubik\'s algorithms.',
    latex: '[A,B] = ABA^{-1}B^{-1}',
  },
  {
    term: 'conjugate',
    title: 'Conjugates',
    body: 'The conjugate A B A⁻¹ applies B but in A\'s "context". This is how algorithms are transformed to work on different pieces without changing their structure.',
    latex: 'ABA^{-1}',
  },
]

function ConceptCard({ concept }: { concept: Concept }) {
  return (
    <motion.div
      className="concept-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <h4 className="concept-title">{concept.title}</h4>
      <p className="concept-body">{concept.body}</p>
    </motion.div>
  )
}

function AlgorithmCard({ alg }: { alg: typeof FAMOUS_ALGORITHMS[0] }) {
  const { applySequence } = useCubeStore()

  return (
    <button
      className="algorithm-card"
      onClick={() => applySequence(alg.moves)}
      title={`Apply: ${alg.moves.join(' ')}`}
    >
      <div className="alg-name">{alg.name}</div>
      <div className="alg-moves">{alg.moves.join(' ')}</div>
      <div className="alg-desc">{alg.description}</div>
    </button>
  )
}

export function ExplanationPanel() {
  const { groupProps, hoveredFace } = useCubeStore()

  // Show contextual concept based on hover or state
  let activeConceptKey: string | null = null
  if (hoveredFace) {
    activeConceptKey = 'group'
  } else if (!groupProps.isSolved && groupProps.order > 1) {
    activeConceptKey = 'order'
  }

  const activeConcept = CONCEPTS.find(c => c.term === activeConceptKey) || CONCEPTS[0]

  return (
    <div className="explanation-panel">
      <div className="explanation-section">
        <h3 className="section-title">Concepts</h3>
        <AnimatePresence mode="wait">
          <ConceptCard key={activeConcept.term} concept={activeConcept} />
        </AnimatePresence>

        <div className="concept-nav">
          {CONCEPTS.map(c => (
            <button key={c.term} className="concept-pill" title={c.title}>
              {c.term}
            </button>
          ))}
        </div>
      </div>

      <div className="explanation-section">
        <h3 className="section-title">Famous Algorithms</h3>
        <div className="algorithms-grid">
          {FAMOUS_ALGORITHMS.map(alg => (
            <AlgorithmCard key={alg.name} alg={alg} />
          ))}
        </div>
      </div>
    </div>
  )
}

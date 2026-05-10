import { useState, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { useCubeStore } from '../../store/useCubeStore'
import { FAMOUS_ALGORITHMS } from '../../core/groupTheory'
import { motion, AnimatePresence } from 'framer-motion'

function renderKatex(str: string): string {
  try {
    return katex.renderToString(str, { throwOnError: false, output: 'html', displayMode: true })
  } catch {
    return str
  }
}

// ── Tutorial Steps ────────────────────────────────────────────
interface Step {
  id: number
  title: string
  symbol: string
  body: string
  action: string | null
  unlockAt: number  // moveHistory.length required
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'The Group',
    symbol: 'G',
    body: `A <strong>group</strong> is a set G with an operation satisfying four axioms:
      <ul class="step-list-items">
        <li><b>Closure</b> — combining two elements gives another element in G</li>
        <li><b>Associativity</b> — (ab)c = a(bc)</li>
        <li><b>Identity</b> — there exists e such that g·e = e·g = g</li>
        <li><b>Inverses</b> — every element has an element that undoes it</li>
      </ul>
      The Rubik's cube has <strong>43,252,003,274,489,856,000</strong> positions — every scrambled state is a group element.`,
    action: 'Try clicking any move button below the cube to get started →',
    unlockAt: 0,
  },
  {
    id: 2,
    title: 'Permutations',
    symbol: 'σ',
    body: `Each cube state is a <strong>permutation</strong> of 48 stickers (8 per face × 6 faces, centers excluded). A permutation is a bijection — every sticker goes to exactly one new position.
      <br/><br/>
      The formula panel on the right shows your current sequence. The identity permutation <em>e</em> is the solved state — every sticker is home.
      <br/><br/>
      Notice how the 3D cube updates instantly as you click moves!`,
    action: 'Apply a few different moves — mix R, U, F',
    unlockAt: 1,
  },
  {
    id: 3,
    title: 'Order of an Element',
    symbol: 'ord(g)',
    body: `The <strong>order</strong> of a group element g is the smallest positive integer n such that gⁿ = e (identity).
      <br/><br/>
      For a single face move: ord(R) = <strong>4</strong>. Press R four times in a row — the cube returns to solved! You can see the order update live in the formula panel.
      <br/><br/>
      The maximum order in the Rubik's cube group is <strong>1260</strong>, achieved by certain combinations (e.g., a sequence with cycle lengths whose LCM = 1260).`,
    action: 'Reset and press R four times — watch "ord(g)" in the formula panel',
    unlockAt: 4,
  },
  {
    id: 4,
    title: 'Inverse Elements',
    symbol: 'g⁻¹',
    body: `Every group element g has an <strong>inverse</strong> g⁻¹ such that g·g⁻¹ = e. For moves, the inverse is written with a prime: R⁻¹ = R′.
      <br/><br/>
      This is one of the four group axioms — inverses must always exist. Click <em>Solve (g⁻¹)</em> in the move controls to apply the inverse of your entire sequence and return to solved.
      <br/><br/>
      <em>Fun fact</em>: R2⁻¹ = R2, because two 180° turns cancel each other.`,
    action: 'Try R then R′ — see them cancel. Then use "Solve (g⁻¹)"',
    unlockAt: 8,
  },
  {
    id: 5,
    title: 'Composition',
    symbol: 'g·h',
    body: `Applying two moves in sequence is <strong>composition</strong>: R·U applies R then U. The result is always another group element — groups are <em>closed</em>.
      <br/><br/>
      Crucially, R·U ≠ U·R — the cube group is <strong>non-abelian</strong> (non-commutative). This asymmetry is what makes the puzzle non-trivial.
      <br/><br/>
      The order of a composite can be much larger than the individual orders. R has order 4, U has order 4, but R·U can have order 105!`,
    action: 'Try R U versus U R — see that they give different states',
    unlockAt: 10,
  },
  {
    id: 6,
    title: 'Cycle Notation',
    symbol: '(a b c)',
    body: `Every permutation decomposes uniquely into <strong>disjoint cycles</strong>. A cycle (a b c) means:
      <ul class="step-list-items">
        <li>Sticker at position a moves to b</li>
        <li>Sticker at b moves to c</li>
        <li>Sticker at c moves back to a</li>
      </ul>
      The formula panel shows the full cycle decomposition of your current state.
      <br/><br/>
      <strong>Key theorem:</strong> ord(g) = lcm of all cycle lengths. That's why some sequences have order 1260 = lcm(4, 5, 7, 9).`,
    action: 'Look at the cycle notation in the formula panel for your current state',
    unlockAt: 14,
  },
  {
    id: 7,
    title: 'Commutators',
    symbol: '[A, B]',
    body: `The <strong>commutator</strong> [A, B] = A B A⁻¹ B⁻¹ measures how much A and B fail to commute.
      <br/><br/>
      If AB = BA, then [A,B] = e. But in the cube group, most moves don't commute, so [A,B] is nontrivial.
      <br/><br/>
      The "Sexy Move" R U R′ U′ is the commutator [R, U]. Applied 6 times, it returns to solved. Commutators are the backbone of speedcubing algorithms — they permute just a few pieces while leaving others fixed.`,
    action: 'Go to the Algorithms tab and try the Sexy Move',
    unlockAt: 18,
  },
  {
    id: 8,
    title: 'Conjugates',
    symbol: 'gXg⁻¹',
    body: `The <strong>conjugate</strong> A B A⁻¹ applies B "in A's context". If B is a 3-cycle, then A B A⁻¹ is also a 3-cycle — conjugation preserves cycle type.
      <br/><br/>
      This is extremely powerful: if you know an algorithm to solve one corner, conjugating it lets you solve any corner without relearning the algorithm. Speedcubers use this constantly.
      <br/><br/>
      🎉 <strong>You've completed the tour!</strong> You now understand the mathematical foundation of the Rubik's cube: groups, permutations, order, inverses, composition, cycles, commutators, and conjugates.`,
    action: null,
    unlockAt: 25,
  },
]

// ── Concept Reference ─────────────────────────────────────────
const CONCEPTS = [
  {
    term: 'group',
    title: 'Group (G, ·)',
    body: `A group (G, ·) satisfies:<br/>
      • <b>Closure</b>: ∀a,b∈G ⟹ a·b∈G<br/>
      • <b>Associativity</b>: (a·b)·c = a·(b·c)<br/>
      • <b>Identity</b>: ∃e∈G, e·a = a·e = a<br/>
      • <b>Inverses</b>: ∀a∈G, ∃a⁻¹∈G, a·a⁻¹ = e<br/><br/>
      The Rubik's cube group is a finite group of order 43,252,003,274,489,856,000.`,
    latex: 'G, \\cdot',
  },
  {
    term: 'permutation',
    title: 'Permutation (σ)',
    body: `A permutation is a bijection σ: X→X. The Rubik's cube group is a subgroup of S₄₈ — the symmetric group on 48 sticker positions.<br/><br/>
      Composition: (σ∘τ)(x) = σ(τ(x)).<br/><br/>
      The identity permutation is σ(x) = x for all x.`,
    latex: '\\sigma \\in S_{48}',
  },
  {
    term: 'order',
    title: 'Order',
    body: `The order of g∈G is the smallest n∈ℕ with gⁿ = e.<br/><br/>
      <b>Lagrange's theorem</b>: ord(g) divides |G| for finite groups.<br/><br/>
      For a permutation with cycle type (c₁, c₂, …, cₖ):<br/>
      ord(σ) = lcm(c₁, c₂, …, cₖ)<br/><br/>
      Maximum order in the Rubik's cube group: <b>1260</b>.`,
    latex: '\\mathrm{ord}(g) = \\min\\{n \\in \\mathbb{N} : g^n = e\\}',
  },
  {
    term: 'cycle',
    title: 'Cycle Notation',
    body: `A k-cycle (a₁ a₂ … aₖ) maps a₁↦a₂↦…↦aₖ↦a₁ and fixes all others.<br/><br/>
      Every permutation decomposes <b>uniquely</b> into disjoint cycles (up to ordering and cyclic rotation of each cycle).<br/><br/>
      A 1-cycle (fixed point) is omitted by convention. A transposition is a 2-cycle. Every permutation is a product of transpositions.`,
    latex: '(a_1\\;a_2\\;\\cdots\\;a_k)',
  },
  {
    term: 'commutator',
    title: 'Commutator [A, B]',
    body: `[A, B] = ABA⁻¹B⁻¹<br/><br/>
      [A,B] = e iff A and B commute (AB = BA).<br/><br/>
      The commutator subgroup [G,G] = ⟨[a,b] : a,b∈G⟩ is the smallest normal subgroup with abelian quotient.<br/><br/>
      In speedcubing: commutators permute a small number of pieces while fixing all others.`,
    latex: '[A,B] = ABA^{-1}B^{-1}',
  },
  {
    term: 'conjugate',
    title: 'Conjugate (gXg⁻¹)',
    body: `The conjugate of B by A is ABA⁻¹.<br/><br/>
      <b>Key property</b>: conjugate elements have the same cycle type (and therefore the same order).<br/><br/>
      Two elements a,b∈G are conjugate iff they are in the same conjugacy class.<br/><br/>
      In speedcubing: if you can solve one piece with algorithm B, then ABA⁻¹ solves the piece that A sends to B's target location.`,
    latex: 'ABA^{-1}',
  },
]

// ── Component ─────────────────────────────────────────────────

type Tab = 'learn' | 'concepts' | 'algorithms'

export function ExplanationPanel() {
  const { moveHistory, applySequence } = useCubeStore()

  const [tab, setTab] = useState<Tab>('learn')
  const [currentStep, setCurrentStep] = useState(0)
  const [unlockedUpTo, setUnlockedUpTo] = useState(0)
  const [selectedConcept, setSelectedConcept] = useState('group')

  // Auto-unlock steps based on history length
  useEffect(() => {
    const len = moveHistory.length
    let highest = 0
    for (let i = 0; i < STEPS.length; i++) {
      if (len >= STEPS[i].unlockAt) highest = i
    }
    if (highest > unlockedUpTo) {
      setUnlockedUpTo(highest)
      // Auto-advance to the new step (gentle nudge)
      if (highest > currentStep) setCurrentStep(highest)
    }
  }, [moveHistory.length])

  const step = STEPS[currentStep]
  const activeConcept = CONCEPTS.find(c => c.term === selectedConcept) ?? CONCEPTS[0]
  const progress = Math.round((unlockedUpTo / (STEPS.length - 1)) * 100)

  return (
    <div className="explanation-panel">
      {/* Tab bar */}
      <div className="exp-tabs">
        {(['learn', 'concepts', 'algorithms'] as Tab[]).map(t => (
          <button
            key={t}
            className={`exp-tab ${tab === t ? 'exp-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'learn' ? '📖 Learn' : t === 'concepts' ? '∑ Concepts' : '⚡ Algorithms'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="exp-body">
        <AnimatePresence mode="wait">

          {/* ── LEARN TAB ──────────────────────────────────────── */}
          {tab === 'learn' && (
            <motion.div key="learn" className="learn-panel"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Step pills */}
              <div className="step-pills">
                {STEPS.map((s, i) => {
                  const locked = i > unlockedUpTo
                  const active = i === currentStep
                  return (
                    <button
                      key={s.id}
                      className={`step-pill ${active ? 'step-pill--active' : ''} ${locked ? 'step-pill--locked' : ''}`}
                      onClick={() => !locked && setCurrentStep(i)}
                      title={locked ? `Complete ${STEPS[i].unlockAt - moveHistory.length} more moves to unlock` : s.title}
                    >
                      {locked ? '🔒' : s.symbol}
                    </button>
                  )
                })}
                <div className="step-progress-bar">
                  <div className="step-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div key={step.id} className="step-card"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="step-header">
                    <span className="step-symbol">{step.symbol}</span>
                    <div>
                      <div className="step-num-label">Step {step.id} of {STEPS.length}</div>
                      <h4 className="step-title">{step.title}</h4>
                    </div>
                  </div>

                  <div
                    className="step-body"
                    dangerouslySetInnerHTML={{ __html: step.body }}
                  />

                  {step.action && (
                    <div className="step-action">
                      <span className="step-action-arrow">▶</span>
                      <span>{step.action}</span>
                    </div>
                  )}

                  <div className="step-nav">
                    <button
                      className="step-btn"
                      onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
                      disabled={currentStep === 0}
                    >
                      ← Prev
                    </button>
                    <button
                      className={`step-btn ${currentStep < unlockedUpTo ? 'step-btn--primary' : ''}`}
                      onClick={() => setCurrentStep(p => Math.min(unlockedUpTo, p + 1))}
                      disabled={currentStep >= unlockedUpTo}
                      title={currentStep >= unlockedUpTo ? `Make ${STEPS[Math.min(currentStep + 1, STEPS.length - 1)].unlockAt - moveHistory.length} more moves to unlock` : ''}
                    >
                      {currentStep >= STEPS.length - 1
                        ? '🎉 Complete!'
                        : currentStep >= unlockedUpTo
                        ? `🔒 ${Math.max(0, STEPS[Math.min(currentStep + 1, STEPS.length - 1)].unlockAt - moveHistory.length)} moves to unlock`
                        : 'Next →'}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── CONCEPTS TAB ───────────────────────────────────── */}
          {tab === 'concepts' && (
            <motion.div key="concepts" className="concepts-panel"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="concept-pills">
                {CONCEPTS.map(c => (
                  <button
                    key={c.term}
                    className={`concept-pill ${selectedConcept === c.term ? 'concept-pill--active' : ''}`}
                    onClick={() => setSelectedConcept(c.term)}
                  >
                    {c.term}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeConcept.term} className="concept-card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  <h4 className="concept-title">{activeConcept.title}</h4>
                  <div className="concept-body" dangerouslySetInnerHTML={{ __html: activeConcept.body }} />
                  {activeConcept.latex && (
                    <div
                      className="concept-latex"
                      dangerouslySetInnerHTML={{ __html: renderKatex(activeConcept.latex) }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── ALGORITHMS TAB ─────────────────────────────────── */}
          {tab === 'algorithms' && (
            <motion.div key="algorithms" className="algorithms-panel"
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              <p className="algs-intro">Click any algorithm to apply it to your current cube state. These are famous sequences used in speedcubing and group theory demonstrations.</p>
              <div className="algorithms-grid">
                {FAMOUS_ALGORITHMS.map(alg => (
                  <button
                    key={alg.name}
                    className="algorithm-card"
                    onClick={() => applySequence(alg.moves)}
                    title={`Apply: ${alg.moves.join(' ')}`}
                  >
                    <div className="alg-name">{alg.name}</div>
                    <div className="alg-moves">{alg.moves.join(' ')}</div>
                    <div className="alg-desc">{alg.description}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

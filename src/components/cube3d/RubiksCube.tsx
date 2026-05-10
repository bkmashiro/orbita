import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useCubeStore } from '../../store/useCubeStore'
import { buildCubieRenderData, type CubieRenderData, type FaceName } from './cubeGeometry'
import * as THREE from 'three'

// Face transforms: position and rotation for each sticker face of a cubie
const FACE_TRANSFORMS: Record<FaceName, { pos: [number, number, number]; rot: [number, number, number] }> = {
  U: { pos: [0,  0.451, 0],  rot: [-Math.PI / 2, 0, 0] },
  D: { pos: [0, -0.451, 0],  rot: [Math.PI / 2, 0, 0] },
  R: { pos: [0.451, 0, 0],   rot: [0, Math.PI / 2, 0] },
  L: { pos: [-0.451, 0, 0],  rot: [0, -Math.PI / 2, 0] },
  F: { pos: [0, 0, 0.451],   rot: [0, 0, 0] },
  B: { pos: [0, 0, -0.451],  rot: [0, Math.PI, 0] },
}

// Which cubie positions belong to each face
const FACE_PRED: Record<string, (p: [number, number, number]) => boolean> = {
  R: p => p[0] === 1,
  L: p => p[0] === -1,
  U: p => p[1] === 1,
  D: p => p[1] === -1,
  F: p => p[2] === 1,
  B: p => p[2] === -1,
}

function StickerFace({ face, color, highlighted }: {
  face: FaceName; color: string; highlighted: boolean
}) {
  const t = FACE_TRANSFORMS[face]
  return (
    <mesh position={t.pos} rotation={t.rot}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={color}
        emissive={highlighted ? new THREE.Color(color) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={highlighted ? 0.45 : 0}
        roughness={0.25}
        metalness={0.1}
      />
    </mesh>
  )
}

function Cubie({ pos, colors, isHighlighted }: CubieRenderData) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    if (isHighlighted) {
      const t = Date.now() * 0.003
      groupRef.current.position.set(
        pos[0] * 1.03 + Math.sin(t) * 0.012 * (pos[0] || 0.5),
        pos[1] * 1.03 + Math.sin(t + 1) * 0.012 * (pos[1] || 0.5),
        pos[2] * 1.03 + Math.sin(t + 2) * 0.012 * (pos[2] || 0.5),
      )
    } else {
      groupRef.current.position.set(pos[0], pos[1], pos[2])
    }
  })

  return (
    <group ref={groupRef} position={pos}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
      </mesh>
      {(Object.entries(colors) as [FaceName, string][]).map(([face, color]) => (
        <StickerFace key={face} face={face} color={color} highlighted={isHighlighted} />
      ))}
    </group>
  )
}

// Separate component so useFrame subscription is isolated
function AnimatedFaceGroup({ animCubies }: { animCubies: CubieRenderData[] }) {
  const pendingAnimation = useCubeStore(s => s.pendingAnimation)
  const clearAnimation = useCubeStore(s => s.clearAnimation)
  const groupRef = useRef<THREE.Group>(null)
  const doneRef = useRef(false)
  const prevAnimRef = useRef(pendingAnimation)

  // Reset done flag when animation changes
  if (prevAnimRef.current !== pendingAnimation) {
    prevAnimRef.current = pendingAnimation
    doneRef.current = false
  }

  useFrame(() => {
    if (!pendingAnimation || !groupRef.current || doneRef.current) {
      if (groupRef.current) groupRef.current.rotation.set(0, 0, 0)
      return
    }
    const elapsed = Date.now() - pendingAnimation.startTime
    const t = Math.min(elapsed / pendingAnimation.duration, 1)
    // Ease in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const angle = pendingAnimation.angle * ease
    const [ax, ay, az] = pendingAnimation.axis
    groupRef.current.rotation.set(ax * angle, ay * angle, az * angle)
    if (t >= 1) {
      doneRef.current = true
      clearAnimation()
    }
  })

  return (
    <group ref={groupRef}>
      {animCubies.map((cubie, i) => (
        <Cubie key={i} {...cubie} />
      ))}
    </group>
  )
}

function CubeScene() {
  const perm = useCubeStore(s => s.perm)
  const hoveredFace = useCubeStore(s => s.hoveredFace)
  const pendingAnimation = useCubeStore(s => s.pendingAnimation)

  const currentCubies = buildCubieRenderData(perm, hoveredFace)

  let staticCubies = currentCubies
  let animCubies: CubieRenderData[] = []

  if (pendingAnimation) {
    const pred = FACE_PRED[pendingAnimation.face]
    staticCubies = currentCubies.filter(c => !pred(c.pos))
    const fromCubies = buildCubieRenderData(pendingAnimation.fromPerm, hoveredFace)
    animCubies = fromCubies.filter(c => pred(c.pos))
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.8, 3.2, 4.5]} fov={45} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        dampingFactor={0.08}
        enableDamping={true}
      />
      <ambientLight intensity={0.7} color="#e8e8ff" />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[-6, -4, -6]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[6, -6, 6]} intensity={0.2} color="#f59e0b" />

      {staticCubies.map((c, i) => <Cubie key={`s${i}`} {...c} />)}

      {pendingAnimation && (
        <AnimatedFaceGroup animCubies={animCubies} />
      )}
    </>
  )
}

export function RubiksCubeScene() {
  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
        <CubeScene />
      </Canvas>
    </div>
  )
}

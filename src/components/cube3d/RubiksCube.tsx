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

function StickerFace({
  face,
  color,
  highlighted,
}: {
  face: FaceName
  color: string
  highlighted: boolean
}) {
  const t = FACE_TRANSFORMS[face]
  return (
    <mesh position={t.pos} rotation={t.rot}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={color}
        emissive={highlighted ? new THREE.Color(color) : new THREE.Color(0, 0, 0)}
        emissiveIntensity={highlighted ? 0.5 : 0}
        roughness={0.25}
        metalness={0.1}
      />
    </mesh>
  )
}

function Cubie({ pos, colors, isHighlighted }: CubieRenderData) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (groupRef.current && isHighlighted) {
      const t = Date.now() * 0.003
      groupRef.current.position.set(
        pos[0] * 1.03 + Math.sin(t) * 0.015 * (pos[0] || 0.5),
        pos[1] * 1.03 + Math.sin(t + 1) * 0.015 * (pos[1] || 0.5),
        pos[2] * 1.03 + Math.sin(t + 2) * 0.015 * (pos[2] || 0.5)
      )
    } else if (groupRef.current) {
      groupRef.current.position.set(pos[0], pos[1], pos[2])
    }
  })

  return (
    <group ref={groupRef} position={pos}>
      {/* Black cubie body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Rounded-look inset bevel */}
      <mesh>
        <boxGeometry args={[0.92, 0.92, 0.92]} />
        <meshStandardMaterial color="#151515" roughness={0.9} transparent opacity={0} />
      </mesh>
      {/* Sticker faces */}
      {(Object.entries(colors) as [FaceName, string][]).map(([face, color]) => (
        <StickerFace key={face} face={face} color={color} highlighted={isHighlighted} />
      ))}
    </group>
  )
}

function CubeScene() {
  const { perm, hoveredFace } = useCubeStore()
  const cubies = buildCubieRenderData(perm, hoveredFace)

  return (
    <>
      <PerspectiveCamera makeDefault position={[3.8, 3.2, 4.5]} fov={45} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={4}
        maxDistance={10}
        dampingFactor={0.08}
        enableDamping={true}
        autoRotate={false}
      />
      <ambientLight intensity={0.7} color="#e8e8ff" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-6, -4, -6]} intensity={0.4} color="#3b82f6" />
      <pointLight position={[6, -6, 6]} intensity={0.2} color="#f59e0b" />

      {cubies.map((cubie, i) => (
        <Cubie key={i} {...cubie} />
      ))}
    </>
  )
}

export function RubiksCubeScene() {
  return (
    <div className="w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CubeScene />
      </Canvas>
    </div>
  )
}

'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, QuadraticBezierLine, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

function DeliveryPackage() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0.2, 0]}>
        {/* Main box */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.9, 0.8]} />
          <meshStandardMaterial color="#FFD700" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Tape on top */}
        <mesh position={[0, 0.451, 0]}>
          <boxGeometry args={[0.15, 0.01, 0.82]} />
          <meshStandardMaterial color="#E5C100" roughness={0.3} />
        </mesh>
        {/* Tape cross */}
        <mesh position={[0, 0.451, 0]}>
          <boxGeometry args={[1.22, 0.01, 0.15]} />
          <meshStandardMaterial color="#E5C100" roughness={0.3} />
        </mesh>
        {/* Box lines */}
        <mesh position={[0, 0, 0.401]}>
          <boxGeometry args={[1.22, 0.01, 0.01]} />
          <meshStandardMaterial color="#B89B00" />
        </mesh>
        <mesh position={[0, 0, -0.401]}>
          <boxGeometry args={[1.22, 0.01, 0.01]} />
          <meshStandardMaterial color="#B89B00" />
        </mesh>
      </group>
    </Float>
  )
}

function RoutePath() {
  const sphereRef = useRef<THREE.Mesh>(null)
  const start = new THREE.Vector3(-3, -0.5, 0)
  const end = new THREE.Vector3(3, -0.5, 0)
  const mid = new THREE.Vector3(0, 2, -1)

  useFrame((state) => {
    if (sphereRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * 0.5) + 1) / 2
      const pos = new THREE.Vector3()
      pos.lerpVectors(start, mid, t)
      pos.lerp(end, t)

      // Quadratic bezier interpolation
      const p0 = start.clone()
      const p1 = mid.clone()
      const p2 = end.clone()
      const oneMinusT = 1 - t
      pos.x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x
      pos.y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y
      pos.z = oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * t * p1.z + t * t * p2.z

      sphereRef.current.position.copy(pos)
    }
  })

  return (
    <>
      <QuadraticBezierLine
        start={start}
        end={end}
        mid={mid}
        color="#FFD700"
        lineWidth={2}
        dashed
        dashScale={8}
        dashSize={0.5}
        gapSize={0.3}
      />
      {/* Traveling sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
      {/* Start point - LA */}
      <mesh position={start.toArray()}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      {/* End point - SV */}
      <mesh position={end.toArray()}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
    </>
  )
}

function Particles({ count = 50 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 5 - 2,
      speed: Math.random() * 0.5 + 0.2,
      offset: Math.random() * Math.PI * 2,
    }))
  }, [count])

  useFrame((state) => {
    if (!meshRef.current) return
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x,
        p.y + Math.sin(state.clock.elapsedTime * p.speed + p.offset) * 0.3,
        p.z
      )
      dummy.scale.setScalar(0.02 + Math.sin(state.clock.elapsedTime * p.speed + p.offset) * 0.01)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} transparent opacity={0.6} />
    </instancedMesh>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 5], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ alpha: true, antialias: true }}
    >
      <PerformanceMonitor>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#FFD700" />
        <pointLight position={[0, 2, 0]} intensity={0.5} color="#FFD700" distance={8} />

        <DeliveryPackage />
        <RoutePath />
        <Particles count={40} />
      </PerformanceMonitor>
    </Canvas>
  )
}

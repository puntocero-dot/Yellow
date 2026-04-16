'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <HeroFallback />,
})

function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs as fallback */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-yellow-500/10 blur-3xl"
        style={{ top: '20%', left: '20%' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-yellow-500/8 blur-3xl"
        style={{ bottom: '20%', right: '20%' }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -20, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-yellow-500/5 blur-2xl"
        style={{ top: '40%', right: '30%' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}

export function HeroCanvas() {
  const [canRender3D, setCanRender3D] = useState(false)

  useEffect(() => {
    // Check device capability
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    const hasEnoughCores = (navigator.hardwareConcurrency || 2) >= 4
    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas')
        return !!(
          canvas.getContext('webgl2') || canvas.getContext('webgl')
        )
      } catch {
        return false
      }
    })()

    setCanRender3D(!isMobile && hasEnoughCores && hasWebGL)
  }, [])

  if (!canRender3D) {
    return <HeroFallback />
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <HeroScene />
      </motion.div>
    </div>
  )
}

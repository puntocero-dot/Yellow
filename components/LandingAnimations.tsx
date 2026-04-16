'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setValue(Math.round(v)),
      })
      return () => controls.stop()
    }
  }, [isInView, target])

  return (
    <span ref={ref}>
      {target >= 1000 ? Math.round(value / 1000) + 'k' : value}
      {suffix}
    </span>
  )
}

export function LandingAnimations() {
  return (
    <section className="py-20 bg-yellow-500/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-12 text-center"
        >
          <div>
            <p className="text-4xl md:text-5xl font-bold text-yellow-500">
              <Counter target={2020} />
            </p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Operando desde</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-yellow-500">
              <Counter target={10000} suffix="+" />
            </p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Envios Exitosos</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-yellow-500">
              <Counter target={100} suffix="%" />
            </p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Cobertura en SV</p>
          </div>
          <div>
            <p className="text-4xl md:text-5xl font-bold text-yellow-500">
              <Counter target={14} />
            </p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Departamentos</p>
          </div>
        </motion.div>
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Validado por estandares logisticos internacionales y socios locales.</p>
          <div className="flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition cursor-default">
            <span className="font-bold border px-3 py-1.5 rounded text-sm">ADUANA SV</span>
            <span className="font-bold border px-3 py-1.5 rounded text-sm">PORT OF LA</span>
            <span className="font-bold border px-3 py-1.5 rounded text-sm">IATA MEMBER</span>
          </div>
        </div>
      </div>
    </section>
  )
}

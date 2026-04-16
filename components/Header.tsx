'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Truck, Calculator, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from '@/components/motion'

const navLinks = [
  { href: '/cotizar', label: 'Cotizar' },
  { href: '/track', label: 'Rastrear' },
  { href: '/pricing', label: 'Tarifas' },
  { href: '/login', label: 'Ingresar' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className="border-b border-border sticky top-0 z-50 transition-all duration-300"
      animate={{
        backgroundColor: scrolled ? 'rgba(30, 30, 30, 0.85)' : 'hsl(var(--card))',
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)',
        boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : '0 0px 0px rgba(0, 0, 0, 0)',
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={`container mx-auto px-4 flex items-center justify-between transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Truck className="w-6 h-6 text-black" />
          </motion.div>
          <span className="text-xl font-bold text-yellow-500">The Yellow Express</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative transition ${
                pathname === link.href
                  ? 'text-yellow-500 font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cotizar" className="hidden sm:block">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button>
                <Calculator className="w-4 h-4 mr-2" />
                Cotizar Envio
              </Button>
            </motion.div>
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 px-3 rounded-lg transition block ${
                      pathname === link.href
                        ? 'text-yellow-500 font-medium bg-yellow-500/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05, duration: 0.3 }}
              >
                <Link href="/cotizar" onClick={() => setMobileMenuOpen(false)} className="sm:hidden">
                  <Button className="w-full">
                    <Calculator className="w-4 h-4 mr-2" />
                    Cotizar Envio
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

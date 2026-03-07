import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from './LoginModal'

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Invitaciones', href: '#invitaciones' },
  { label: 'Sobre Mí', href: '#sobre-mi' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('#inicio')
  const [showLogin, setShowLogin] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = navLinks.map(l => document.querySelector(l.href))
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => s && observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const handleLink = (href: string) => {
    setMenuOpen(false)
    setActive(href)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
          scrolled ? 'glass-nav' : 'bg-transparent nav-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => handleLink('#inicio')}
            className="flex-shrink-0"
          >
            <span className="font-cormorant italic text-ivory text-xl md:text-2xl font-light tracking-wide">
              Pedro <span className="not-italic font-semibold">Vargas</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleLink(link.href)}
                className={`nav-link ${active === link.href ? 'active' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(d => !d)}
              aria-label="Cambiar modo"
              className="w-9 h-9 flex items-center justify-center rounded-full text-ivory/60 hover:text-gold transition-colors hover:bg-white/5"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-ivory/70 hover:text-ivory transition-colors group-hover:text-gold"
                >
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                    <span className="text-gold text-xs font-semibold">{user?.name?.[0]}</span>
                  </div>
                  <span className="font-dm text-sm">{user?.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="user-dropdown absolute right-0 mt-2 w-44 glass-nav rounded-xl border border-white/10 overflow-hidden shadow-xl"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <a
                        href={isAdmin ? '/admin' : '/cliente'}
                        className="flex items-center gap-3 px-4 py-3 text-ivory/70 hover:text-ivory dark:text-ivory/70 dark:hover:text-ivory hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-dm text-sm"
                      >
                        <LayoutDashboard size={15} />
                        {isAdmin ? 'Panel Admin' : 'Mi Portal'}
                      </a>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-ivory/50 hover:text-danger dark:text-ivory/50 dark:hover:text-danger hover:bg-danger/10 transition-colors font-dm text-sm border-t border-black/5 dark:border-white/5"
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition-colors font-dm text-sm"
              >
                <User size={16} />
                Ingresar
              </button>
            )}
            <button
              onClick={() => handleLink('#contacto')}
              className="btn-outline text-xs py-3 px-6"
            >
              Reservar Sesión
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 relative z-[1001]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-ivory origin-center transition-colors"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="block w-6 h-px bg-ivory"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-6 h-px bg-ivory origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  onClick={() => handleLink(link.href)}
                  className="font-cormorant text-4xl font-light text-ivory hover:text-gold transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: navLinks.length * 0.07 + 0.1 }}
                onClick={() => handleLink('#contacto')}
                className="btn-outline mt-4"
              >
                Reservar Sesión
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: navLinks.length * 0.07 + 0.15 }}
                onClick={() => setDark(d => !d)}
                aria-label="Cambiar modo"
                className="flex items-center gap-2 text-ivory/50 hover:text-gold font-dm text-sm mt-1 transition-colors"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                {dark ? 'Modo claro' : 'Modo oscuro'}
              </motion.button>
              {!isAuthenticated && (
                <motion.button
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: navLinks.length * 0.07 + 0.2 }}
                  onClick={() => { setMenuOpen(false); setShowLogin(true) }}
                  className="flex items-center gap-2 text-ivory/60 hover:text-ivory font-dm text-sm mt-2 transition-colors"
                >
                  <User size={16} />
                  Iniciar Sesión
                </motion.button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  )
}

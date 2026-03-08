/**
 * SpotlightTour — motor compartido de tutorial con spotlight en tiempo real.
 * Usado por AdminTutorial y ClientTutorial.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, ArrowRight, ArrowLeft } from 'lucide-react'

const IVORY = '#F5F0E8'
const GOLD  = '#C9A96E'
const iv = (a: number): React.CSSProperties => ({ color: `rgba(245,240,232,${a})` })

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface TourStep {
  targetId: string | null      // value of the selector attribute, null = centered card
  sectionLabel: string
  title: string
  body: React.ReactNode
  tip?: string
  placement?: 'auto' | 'below' // 'below' forces tooltip under the element
}

export interface SpotlightTourProps {
  tourKey: string              // localStorage key, e.g. 'admin_tour_done'
  steps: TourStep[]
  selectorAttr?: string        // attribute name: 'data-tutorial' | 'data-client-tour'
  brandLabel?: string          // subtitle in welcome card
  startDelay?: number          // ms before showing (default 700)
  onStepChange?: (step: number) => void  // fires before each step (use to open sidebars)
}

// ─── Spotlight overlay (SVG with cutout hole) ─────────────────────────────────

function SpotlightOverlay({ rect, pad = 14 }: { rect: DOMRect | null; pad?: number }) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-auto"
      style={{ zIndex: 9990 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block' }}>
        {rect ? (
          <>
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - pad}
                  y={rect.top  - pad}
                  width={rect.width  + pad * 2}
                  height={rect.height + pad * 2}
                  rx="10"
                  fill="black"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.82)" mask="url(#spotlight-mask)" />
          </>
        ) : (
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.78)" />
        )}
      </svg>
    </motion.div>
  )
}

// ─── Pulsing gold ring ─────────────────────────────────────────────────────────

function HighlightRing({ rect, pad = 10 }: { rect: DOMRect; pad?: number }) {
  return (
    <motion.div
      className="fixed pointer-events-none rounded-xl"
      style={{ zIndex: 9992 }}
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="absolute rounded-xl"
        animate={{
          boxShadow: [
            '0 0 0 3px rgba(201,169,110,0.15), 0 0 18px rgba(201,169,110,0.35)',
            '0 0 0 5px rgba(201,169,110,0.28), 0 0 36px rgba(201,169,110,0.65)',
            '0 0 0 3px rgba(201,169,110,0.15), 0 0 18px rgba(201,169,110,0.35)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          left: rect.left  - pad,
          top:  rect.top   - pad,
          width:  rect.width  + pad * 2,
          height: rect.height + pad * 2,
          border: `2px solid ${GOLD}`,
        }}
      />
    </motion.div>
  )
}

// ─── Welcome card (step 0, centered) ─────────────────────────────────────────

function WelcomeCard({
  step0,
  total,
  brandLabel,
  onNext,
  onSkip,
}: {
  step0: TourStep
  total: number
  brandLabel?: string
  onNext: () => void
  onSkip: () => void
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.93, y: 20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative pointer-events-auto w-full max-w-md rounded-2xl p-8 text-center space-y-5 overflow-hidden"
        style={{
          backgroundColor: '#111111',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 72px rgba(0,0,0,0.72)',
        }}
      >
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD} 35%, ${GOLD} 65%, transparent)` }} />

        {/* Close */}
        <button onClick={onSkip}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/8"
          style={iv(0.3)}
          onMouseEnter={e => (e.currentTarget.style.color = IVORY)}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.3)')}
        >
          <X size={14} />
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
          transition={{ duration: 0.55, times: [0, 0.58, 1] }}
          className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.18), rgba(201,169,110,0.03))',
            border: '1px solid rgba(201,169,110,0.3)',
            boxShadow: '0 0 40px rgba(201,169,110,0.2)',
          }}
        >
          <Camera size={34} color={GOLD} strokeWidth={1.5} />
        </motion.div>

        <div className="space-y-1.5">
          <h2 className="font-cormorant text-3xl leading-tight" style={{ color: IVORY }}>
            {step0.title}
          </h2>
          {brandLabel && (
            <p className="font-dm text-xs tracking-widest uppercase" style={{ color: GOLD, opacity: 0.8 }}>
              {brandLabel}
            </p>
          )}
        </div>

        <p className="font-dm text-sm leading-relaxed max-w-xs mx-auto" style={iv(0.62)}>
          {step0.body}
        </p>

        {/* Dot preview */}
        <div className="flex justify-center gap-2 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300" style={{
              width: i === 0 ? 16 : 6, height: 6,
              backgroundColor: i === 0 ? GOLD : 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button onClick={onSkip} className="font-dm text-xs transition-colors" style={iv(0.3)}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.55)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.3)')}
          >
            Saltar tutorial
          </button>
          <motion.button onClick={onNext} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="font-dm text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
            style={{ backgroundColor: GOLD, color: '#0A0A0A' }}
          >
            Comenzar <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Floating tooltip (steps 1+) ─────────────────────────────────────────────

function TooltipCard({
  stepData,
  rect,
  stepIndex,
  total,
  onNext,
  onPrev,
  onSkip,
  isLast,
}: {
  stepData: TourStep
  rect: DOMRect | null
  stepIndex: number
  total: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  isLast: boolean
}) {
  const W = Math.min(310, window.innerWidth - 32)

  let left = 0, top = 0
  type Arrow = 'left' | 'right' | 'top' | 'none'
  let arrow: Arrow = 'none'

  if (rect) {
    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const approxH = 250

    const forceBelow = stepData.placement === 'below'
    const spaceRight = vpW - rect.right

    if (!forceBelow && spaceRight >= W + 24) {
      left  = rect.right + 16
      top   = rect.top + rect.height / 2 - approxH / 2
      arrow = 'left'
    } else if (!forceBelow && rect.left >= W + 24) {
      left  = rect.left - W - 16
      top   = rect.top + rect.height / 2 - approxH / 2
      arrow = 'right'
    } else {
      // Below
      left  = Math.min(rect.left, vpW - W - 16)
      top   = rect.bottom + 14
      arrow = 'top'
    }

    top  = Math.max(16, Math.min(top,  vpH - approxH - 16))
    left = Math.max(16, Math.min(left, vpW - W - 16))
  } else {
    left = (window.innerWidth - W) / 2
    top  = window.innerHeight * 0.65
  }

  const arrowEl =
    arrow === 'left'  ? <div style={{ position:'absolute', left:-8, top:'50%', transform:'translateY(-50%)', width:0, height:0, borderTop:'7px solid transparent', borderBottom:'7px solid transparent', borderRight:'8px solid #1A1A1A' }} /> :
    arrow === 'right' ? <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', width:0, height:0, borderTop:'7px solid transparent', borderBottom:'7px solid transparent', borderLeft:'8px solid #1A1A1A' }} /> :
    arrow === 'top'   ? <div style={{ position:'absolute', top:-8, left:20, width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderBottom:'8px solid #1A1A1A' }} /> :
    null

  return (
    <motion.div
      key={stepIndex}
      className="fixed pointer-events-auto"
      style={{ zIndex: 9999, left, top, width: W }}
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1   }}
      exit={{    opacity: 0, scale: 0.93 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative rounded-2xl p-5 space-y-3"
        style={{
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,169,110,0.08)',
        }}
      >
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD} 40%, ${GOLD} 60%, transparent)` }} />

        {arrowEl}

        {/* Label + close */}
        <div className="flex items-center justify-between">
          <span className="font-dm text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(201,169,110,0.12)', color: GOLD }}>
            {stepIndex}/{total - 1} — {stepData.sectionLabel}
          </span>
          <button onClick={onSkip}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-white/8"
            style={iv(0.3)}
            onMouseEnter={e => (e.currentTarget.style.color = IVORY)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.3)')}
          >
            <X size={13} />
          </button>
        </div>

        <h3 className="font-cormorant text-xl leading-snug" style={{ color: IVORY }}>
          {stepData.title}
        </h3>

        <p className="font-dm text-xs leading-relaxed" style={iv(0.68)}>
          {stepData.body}
        </p>

        {stepData.tip && (
          <div className="rounded-lg px-3 py-2"
            style={{ backgroundColor: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.18)' }}>
            <p className="font-dm text-[11px] leading-relaxed" style={iv(0.65)}>
              💡 {stepData.tip}
            </p>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300" style={{
              width:  i === stepIndex ? 14 : 5,
              height: 5,
              backgroundColor:
                i === stepIndex ? GOLD
                : i < stepIndex ? 'rgba(201,169,110,0.4)'
                : 'rgba(255,255,255,0.12)',
            }} />
          ))}
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <button onClick={onPrev}
            className="font-dm text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={iv(0.42)}
            onMouseEnter={e => (e.currentTarget.style.color = IVORY)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.42)')}
          >
            <ArrowLeft size={12} /> Anterior
          </button>
          <motion.button onClick={onNext} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            className="font-dm text-xs font-semibold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
            style={{
              backgroundColor: GOLD, color: '#0A0A0A',
              ...(isLast ? { boxShadow: '0 0 18px rgba(201,169,110,0.45)' } : {}),
            }}
          >
            {isLast ? '¡Listo!' : 'Siguiente'}
            {!isLast && <ArrowRight size={12} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SpotlightTour({
  tourKey,
  steps,
  selectorAttr = 'data-tutorial',
  brandLabel,
  startDelay = 700,
  onStepChange,
}: SpotlightTourProps) {
  const [visible, setVisible] = useState(false)
  const [step,    setStep]    = useState(0)
  const [rect,    setRect]    = useState<DOMRect | null>(null)

  useEffect(() => {
    if (localStorage.getItem(tourKey) !== 'true') {
      const t = setTimeout(() => setVisible(true), startDelay)
      return () => clearTimeout(t)
    }
  }, [tourKey, startDelay])

  // Listen for manual re-trigger from the help button
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent
      if (ce.detail?.tourKey === tourKey) {
        setStep(0)
        setRect(null)
        setVisible(true)
      }
    }
    window.addEventListener('spotlight:reset', handler)
    return () => window.removeEventListener('spotlight:reset', handler)
  }, [tourKey])

  const queryRect = useCallback(() => {
    const id = steps[step]?.targetId
    if (!id) { setRect(null); return }
    const el = document.querySelector<HTMLElement>(`[${selectorAttr}="${id}"]`)
    if (el) setRect(el.getBoundingClientRect())
    else    setRect(null)
  }, [step, steps, selectorAttr])

  useEffect(() => {
    if (!visible) return
    if (steps[step]?.targetId) {
      onStepChange?.(step)
      setRect(null)
      const t = setTimeout(queryRect, 360)
      return () => clearTimeout(t)
    } else {
      setRect(null)
    }
  }, [step, visible, queryRect, onStepChange, steps])

  useEffect(() => {
    if (!visible) return
    window.addEventListener('resize', queryRect)
    return () => window.removeEventListener('resize', queryRect)
  }, [visible, queryRect])

  function finish() {
    localStorage.setItem(tourKey, 'true')
    setVisible(false)
  }
  function next() { step < steps.length - 1 ? setStep(s => s + 1) : finish() }
  function prev() { if (step > 0) setStep(s => s - 1) }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <SpotlightOverlay key="overlay" rect={rect} />

          <AnimatePresence>
            {rect && step > 0 && <HighlightRing key={`ring-${step}`} rect={rect} />}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <WelcomeCard
                key="welcome"
                step0={steps[0]}
                total={steps.length}
                brandLabel={brandLabel}
                onNext={next}
                onSkip={finish}
              />
            ) : (
              <TooltipCard
                key={`tip-${step}`}
                stepData={steps[step]}
                rect={rect}
                stepIndex={step}
                total={steps.length}
                onNext={next}
                onPrev={prev}
                onSkip={finish}
                isLast={step === steps.length - 1}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

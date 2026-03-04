import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxPhoto {
  id: number
  title: string
  type: string
  src: string
  alt: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index]

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrev()
      if (event.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  let startX = 0
  const onTouchStart = (event: React.TouchEvent) => {
    startX = event.touches[0].clientX
  }
  const onTouchEnd = (event: React.TouchEvent) => {
    const deltaX = event.changedTouches[0].clientX - startX
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? onNext() : onPrev()
    }
  }

  return (
    <motion.div
      className="lightbox-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors z-10"
        onClick={event => {
          event.stopPropagation()
          onPrev()
        }}
        aria-label="Previous"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors z-10"
        onClick={event => {
          event.stopPropagation()
          onNext()
        }}
        aria-label="Next"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <motion.div
        key={index}
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-[92vw] w-full h-[78vh]"
        onClick={event => event.stopPropagation()}
      >
        <div className="w-full h-full rounded-sm overflow-hidden bg-black/70 relative">
          <img src={photo.src} alt={photo.alt} className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="font-cormorant italic text-ivory/80 text-lg">{photo.title}</p>
        <p className="label-caps text-gold text-[0.6rem] mt-1">{photo.type}</p>
        <p className="label-caps text-ivory/30 text-[0.55rem] mt-2">
          {index + 1} / {photos.length}
        </p>
      </div>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownUnit { label: string; value: number }

function getUnits(deadline: Date): CountdownUnit[] {
  const diff = Math.max(0, deadline.getTime() - Date.now())
  const total = Math.floor(diff / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [
    { label: 'Días', value: days },
    { label: 'Horas', value: hours },
    { label: 'Min', value: minutes },
    { label: 'Seg', value: seconds },
  ]
}

export default function RsvpCountdown({ deadline, accentColor }: { deadline: string; accentColor?: string }) {
  const deadlineDate = new Date(deadline)
  const [units, setUnits] = useState<CountdownUnit[]>(getUnits(deadlineDate))
  const expired = deadlineDate.getTime() <= Date.now()

  useEffect(() => {
    if (expired) return
    const id = setInterval(() => setUnits(getUnits(deadlineDate)), 1000)
    return () => clearInterval(id)
  }, [deadline])

  const accent = accentColor || '#C9A96E'

  if (expired) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: accent }}>
        <Clock size={14} />
        El tiempo para confirmar ha vencido
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Clock size={14} style={{ color: accent, flexShrink: 0 }} />
      <div className="flex gap-2">
        {units.map(u => (
          <div key={u.label} className="text-center">
            <div
              className="text-lg font-cormorant font-bold leading-none tabular-nums"
              style={{ color: accent, minWidth: '2ch' }}
            >
              {String(u.value).padStart(2, '0')}
            </div>
            <div className="text-[0.6rem] font-dm uppercase tracking-widest opacity-60" style={{ color: accent }}>
              {u.label}
            </div>
          </div>
        ))}
      </div>
      <span className="text-xs font-dm opacity-50" style={{ color: accent }}>para confirmar</span>
    </div>
  )
}

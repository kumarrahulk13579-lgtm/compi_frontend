import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { RobotMascot } from '@/components/chat/RobotMascot'
import type { RobotState } from '@/lib/robotState'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

const STATES: { state: RobotState; label: string; hint: string }[] = [
  { state: 'idle', label: 'Idle', hint: 'floats, blinks, arms bob' },
  { state: 'thinking', label: 'Thinking', hint: 'head wobble, looks up, dots' },
  { state: 'search', label: 'Search 🔍', hint: 'magnifying glass scans' },
  { state: 'calculator', label: 'Calculator 🧮', hint: 'calculator pops up' },
  { state: 'time', label: 'Time ⏰', hint: 'clock pops up' },
  { state: 'talking', label: 'Talking', hint: 'eyes pulse like speaking' },
]

export function RobotPreviewPage() {
  const [active, setActive] = useState<RobotState>('idle')
  const [size, setSize] = useState(220)
  const [auto, setAuto] = useState(false)
  const { theme, toggle } = useTheme()

  // Auto-cycle through every state so you can watch them all in sequence.
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => {
      setActive((prev) => {
        const i = STATES.findIndex((s) => s.state === prev)
        return STATES[(i + 1) % STATES.length].state
      })
    }, 2500)
    return () => clearInterval(id)
  }, [auto])

  const current = STATES.find((s) => s.state === active)!

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 p-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="text-lg font-semibold">EVA — animation preview</h1>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>

      {/* Stage */}
      <div className="flex min-h-[320px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <RobotMascot state={active} size={size} />
        <div className="text-center">
          <p className="text-base font-medium">{current.label}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{current.hint}</p>
        </div>
      </div>

      {/* State buttons */}
      <div className="flex w-full max-w-2xl flex-wrap justify-center gap-2">
        {STATES.map((s) => (
          <button
            key={s.state}
            onClick={() => {
              setAuto(false)
              setActive(s.state)
            }}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
              active === s.state
                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'border-[var(--border)] hover:bg-[var(--accent)]',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        <label className="flex items-center gap-3 text-sm">
          Size
          <input
            type="range"
            min={80}
            max={320}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="accent-[var(--primary)]"
          />
          <span className="w-10 text-[var(--muted-foreground)]">{size}px</span>
        </label>
        <Button variant={auto ? 'default' : 'outline'} onClick={() => setAuto((a) => !a)}>
          {auto ? 'Stop auto-cycle' : 'Auto-cycle all states'}
        </Button>
      </div>
    </div>
  )
}

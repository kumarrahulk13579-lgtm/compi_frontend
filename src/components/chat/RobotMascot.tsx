import { useId } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { RobotState } from '@/lib/robotState'

interface Props {
  state: RobotState
  size?: number
  className?: string
}

const eyeStyle = { transformBox: 'fill-box', transformOrigin: 'center' } as const

/** Blink (or talk-pulse) keyframes for a single eye. */
function eyeMotion(state: RobotState) {
  if (state === 'talking') {
    return {
      animate: { scaleY: [1, 0.6, 1, 0.8, 1] },
      transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' as const },
    }
  }
  return {
    animate: { scaleY: [1, 1, 0.1, 1] },
    transition: {
      duration: 4,
      repeat: Infinity,
      times: [0, 0.9, 0.95, 1],
      ease: 'easeInOut' as const,
    },
  }
}

/** How the eyes-group shifts/looks depending on what the bot is doing. */
function eyesGroupMotion(state: RobotState) {
  switch (state) {
    case 'thinking':
      return { animate: { x: 4, y: -3 }, transition: { duration: 0.5 } }
    case 'search':
      return {
        animate: { x: [-3, 3, -2, 3, -3], y: [1, -2, 1, -1, 1] },
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    case 'time':
      return { animate: { y: -3, x: 0 }, transition: { duration: 0.5 } }
    default:
      return { animate: { x: 0, y: 0 }, transition: { duration: 0.5 } }
  }
}

export function RobotMascot({ state, size = 120, className }: Props) {
  const eyeAnim = eyeMotion(state)
  const eyesGroup = eyesGroupMotion(state)

  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 140"
      fill="none"
      animate={{ y: [0, -6, 0], rotate: state === 'thinking' ? [-3, 3, -3] : 0 }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      <defs>
        <linearGradient id="evaBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67a8ff" />
          <stop offset="55%" stopColor="#428ffc" />
          <stop offset="100%" stopColor="#2f7ce8" />
        </linearGradient>
        <radialGradient id="evaGloss" cx="0.35" cy="0.28" r="0.5">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft shadow on the floor */}
      <motion.ellipse
        cx="60"
        cy="118"
        rx="24"
        ry="4.5"
        fill="#000000"
        opacity="0.1"
        animate={{ rx: [24, 20, 24], opacity: [0.1, 0.06, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* floating arms (EVE-style detached) */}
      <motion.ellipse
        cx="16"
        cy="74"
        rx="8"
        ry="13"
        fill="url(#evaBody)"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />
      <motion.ellipse
        cx="104"
        cy="74"
        rx="8"
        ry="13"
        fill="url(#evaBody)"
        animate={{ y: state === 'search' || state === 'time' ? -6 : [0, 4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      />

      {/* head — smooth EVE egg shape */}
      <ellipse cx="60" cy="50" rx="40" ry="43" fill="url(#evaBody)" />
      <ellipse cx="60" cy="50" rx="40" ry="43" fill="url(#evaGloss)" />

      {/* eyes — filled with the page background colour */}
      <motion.g {...eyesGroup}>
        <motion.rect
          x="44"
          y="38"
          width="10"
          height="24"
          rx="5"
          fill="var(--background)"
          stroke="#2f6fd0"
          strokeWidth="1"
          transform="rotate(-12 49 50)"
          style={eyeStyle}
          {...eyeAnim}
        />
        <motion.rect
          x="66"
          y="38"
          width="10"
          height="24"
          rx="5"
          fill="var(--background)"
          stroke="#2f6fd0"
          strokeWidth="1"
          transform="rotate(12 71 50)"
          style={eyeStyle}
          {...eyeAnim}
        />
      </motion.g>

      {/* state-specific accessory above / beside the head */}
      <AnimatePresence mode="wait">
        {state === 'search' && <MagnifyingGlass key="search" />}
        {state === 'thinking' && <ThinkingDots key="think" />}
        {state === 'calculator' && <FloatingMath key="calc" />}
        {state === 'time' && <ClockTool key="time" />}
      </AnimatePresence>
    </motion.svg>
  )
}

function MagnifyingGlass() {
  // Unique clip id per instance (avatar + hero can both be on screen).
  const clipId = useId().replace(/:/g, '')
  const scanLineClipId = `${clipId}Lines`
  const cy = 49
  const r = 22
  const scanT = {
    duration: 2.8,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    times: [0, 0.28, 0.52, 0.76, 1],
  }
  // The lens and clip window travel together so the magnified face stays aligned.
  const scanX = [-18, -4, 16, 5, -18]
  const scanY = [2, -4, 2, -6, 2]
  const lensRotate = [-9, -2, 7, 3, -9]
  const zoomX = scanX.map((x) => -x * 0.9)
  const zoomY = scanY.map((y) => -y * 0.9)
  const resultDots = [
    { cx: 48, cy: 42, r: 2.2, delay: 0 },
    { cx: 64, cy: 36, r: 1.8, delay: 0.2 },
    { cx: 70, cy: 56, r: 2.5, delay: 0.38 },
  ]

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
      style={{ transformOrigin: '60px 50px' }}
    >
      <defs>
        <clipPath id={clipId}>
          <motion.circle cx="60" cy={cy} r={r} animate={{ x: scanX, y: scanY }} transition={scanT} />
        </clipPath>
        <clipPath id={scanLineClipId}>
          <circle cx="60" cy={cy} r={r - 4} />
        </clipPath>
      </defs>

      {/* a 1.9x enlarged copy of the face, revealed only through the moving lens.
          The extra shift (-(k-1)*scan) keeps the zoom centred under the lens, so
          it behaves like a real loupe instead of a window over a static image. */}
      <g clipPath={`url(#${clipId})`}>
        <motion.g animate={{ x: zoomX, y: zoomY }} transition={scanT}>
          <g transform="translate(60 50) scale(1.9) translate(-60 -50)">
            <ellipse cx="60" cy="50" rx="40" ry="43" fill="url(#evaBody)" />
            <ellipse cx="60" cy="50" rx="40" ry="43" fill="url(#evaGloss)" />
            <rect
              x="44" y="38" width="10" height="24" rx="5"
              fill="var(--background)" stroke="#2f6fd0" strokeWidth="1"
              transform="rotate(-12 49 50)"
            />
            <rect
              x="66" y="38" width="10" height="24" rx="5"
              fill="var(--background)" stroke="#2f6fd0" strokeWidth="1"
              transform="rotate(12 71 50)"
            />
          </g>
        </motion.g>
      </g>

      <motion.g
        clipPath={`url(#${clipId})`}
        animate={{ x: scanX, y: scanY }}
        transition={scanT}
        opacity="0.8"
      >
        <motion.g
          clipPath={`url(#${scanLineClipId})`}
          animate={{ y: [-9, 9, -9] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
        >
          {[-8, -1, 6].map((offset) => (
            <line
              key={offset}
              x1="41"
              y1={cy + offset}
              x2="79"
              y2={cy + offset}
              stroke="#ffffff"
              strokeOpacity="0.36"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
        </motion.g>
        {resultDots.map((dot) => (
          <motion.circle
            key={`${dot.cx}-${dot.cy}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#ffffff"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0.2, 0.9, 0.2], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          />
        ))}
      </motion.g>

      {/* lens rim + handle, scanning in sync with the clip window */}
      <motion.g
        animate={{ x: scanX, y: scanY, rotate: lensRotate }}
        transition={scanT}
        style={{ transformOrigin: '60px 49px' }}
      >
        <circle cx="60" cy={cy} r={r} fill="#bfdcff" fillOpacity="0.12" />
        <motion.circle
          cx="60"
          cy={cy}
          r={r}
          fill="none"
          stroke="#2f6fd0"
          strokeWidth="5"
          animate={{ strokeWidth: [4.5, 6, 4.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <circle cx="60" cy={cy} r={r - 3.5} fill="none" stroke="#ffffff" strokeOpacity="0.34" strokeWidth="1.5" />
        <ellipse cx="51" cy="40" rx="6" ry="4" fill="#ffffff" fillOpacity="0.42" />
        <ellipse cx="69" cy="59" rx="4" ry="2.4" fill="#ffffff" fillOpacity="0.2" />
        <line
          x1={60 + r * 0.72} y1={cy + r * 0.72}
          x2={60 + r * 0.72 + 17} y2={cy + r * 0.72 + 19}
          stroke="#2f6fd0" strokeWidth="7" strokeLinecap="round"
        />
        <line
          x1={60 + r * 0.72 + 2} y1={cy + r * 0.72 + 2}
          x2={60 + r * 0.72 + 13} y2={cy + r * 0.72 + 14}
          stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.2" strokeLinecap="round"
        />
      </motion.g>
    </motion.g>
  )
}

function ThinkingDots() {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={88 + i * 9}
          cy={14}
          r="3.5"
          fill="#428ffc"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </motion.g>
  )
}

function FloatingMath() {
  // Math symbols drift up around the head and fade, like she's computing.
  const items = [
    { c: '+', x: 24, y: 74, dur: 2.4, delay: 0, size: 19 },
    { c: '7', x: 98, y: 68, dur: 2.8, delay: 0.5, size: 18 },
    { c: '×', x: 36, y: 88, dur: 2.6, delay: 1.0, size: 22 },
    { c: '=', x: 92, y: 86, dur: 2.2, delay: 1.5, size: 18 },
    { c: '÷', x: 60, y: 94, dur: 3.0, delay: 0.7, size: 20 },
    { c: '3', x: 20, y: 96, dur: 2.7, delay: 1.8, size: 18 },
    { c: '−', x: 102, y: 100, dur: 2.5, delay: 1.2, size: 22 },
  ]

  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {items.map((it, i) => (
        <motion.text
          key={i}
          x={it.x}
          y={it.y}
          fontSize={it.size}
          fontWeight="700"
          textAnchor="middle"
          fill="#428ffc"
          fontFamily="ui-monospace, monospace"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -36 }}
          transition={{ duration: it.dur, repeat: Infinity, delay: it.delay, ease: 'easeOut' }}
        >
          {it.c}
        </motion.text>
      ))}
    </motion.g>
  )
}

function ClockTool() {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: [0, -3, 0] }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }, default: { duration: 0.3 } }}
    >
      <circle cx="104" cy="72" r="14" fill="var(--background)" stroke="#2f6fd0" strokeWidth="2.5" />
      <circle cx="104" cy="72" r="2" fill="#2f6fd0" />
      {/* hour hand */}
      <motion.line
        x1="104" y1="72" x2="104" y2="64"
        stroke="#2f6fd0" strokeWidth="2.5" strokeLinecap="round"
        style={{ transformOrigin: '104px 72px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* minute hand */}
      <motion.line
        x1="104" y1="72" x2="104" y2="61"
        stroke="#428ffc" strokeWidth="1.5" strokeLinecap="round"
        style={{ transformOrigin: '104px 72px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
    </motion.g>
  )
}

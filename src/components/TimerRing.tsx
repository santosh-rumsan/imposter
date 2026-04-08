interface TimerRingProps {
  progress: number // 0-1
  formatted: string
  size?: number
  isExpired?: boolean
}

export function TimerRing({ progress, formatted, size = 140, isExpired = false }: TimerRingProps) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const color = isExpired
    ? '#ef4444'
    : progress > 0.5
    ? '#7c3aed'
    : progress > 0.25
    ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <div
        className="text-3xl font-bold"
        style={{ color }}
      >
        {formatted}
      </div>
    </div>
  )
}

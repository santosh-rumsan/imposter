import { useEffect, useRef } from 'react'


interface Particle {
  x: number
  y: number
  r: number
  color: string
  vx: number
  vy: number
  opacity: number
}

const COLORS = [
  '#818cf8', '#c084fc', '#34d399', '#22d3ee',
  '#fb7185', '#fbbf24', '#60a5fa', '#a78bfa',
]

export function ParticleCard({ onClick }: { onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    // Init particles
    particles.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 4 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.3,
    }))

    function draw() {
      ctx!.clearRect(0, 0, W, H)
      for (const p of particles.current) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0')
        ctx!.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      onClick={onClick}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-[#151829] border border-white/10 active:scale-[0.98] transition-transform"
    >
      <canvas
        ref={canvasRef}
        width={360}
        height={270}
        className="w-full h-full"
      />
    </div>
  )
}

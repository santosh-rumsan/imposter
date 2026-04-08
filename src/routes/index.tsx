import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getStats, getSettings } from '../lib/storage'
import { useTranslation } from '../hooks/useTranslation'
import { syncWordPacks } from '../lib/word-pack-loader'

export const Route = createFileRoute('/')({
  component: HomeScreen,
})

function HomeScreen() {
  const settings = getSettings()
  const stats = getStats()
  const { t } = useTranslation(settings.defaultLanguage)

  useEffect(() => {
    syncWordPacks()
  }, [])

  return (
    <div className="min-h-svh flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">

      {/* === Layered background === */}
      <div className="home-bg">
        {/* Swirling circuit SVG layer */}
        <svg className="home-bg-swirl" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* Swirling brushstroke paths — mimic Van Gogh circuit style */}
          <path d="M-20 120 Q80 80 160 140 Q240 200 320 150 Q400 100 460 160" stroke="#2563eb" strokeWidth="2.5" fill="none" opacity="0.5"/>
          <path d="M-20 160 Q90 110 180 175 Q270 240 350 190 Q430 140 480 200" stroke="#1d4ed8" strokeWidth="1.5" fill="none" opacity="0.35"/>
          <path d="M0 300 Q100 260 200 310 Q300 360 400 300 Q480 255 520 310" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M-30 380 Q80 330 180 390 Q280 450 380 400 Q460 360 500 410" stroke="#2563eb" strokeWidth="1.5" fill="none" opacity="0.3"/>
          <path d="M0 480 Q120 440 220 500 Q320 560 420 500 Q500 455 540 510" stroke="#1e40af" strokeWidth="2" fill="none" opacity="0.35"/>
          <path d="M-20 560 Q80 510 180 575 Q280 640 390 580 Q480 530 530 590" stroke="#3b82f6" strokeWidth="1.5" fill="none" opacity="0.3"/>
          <path d="M10 650 Q110 610 210 665 Q310 720 410 665 Q490 620 540 675" stroke="#2563eb" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M-10 720 Q90 680 190 730 Q290 780 400 730 Q480 690 530 745" stroke="#1d4ed8" strokeWidth="1.5" fill="none" opacity="0.3"/>

          {/* Circuit board lines — horizontal + vertical runs with nodes */}
          <g stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.3">
            <polyline points="30,50 30,90 90,90 90,130 150,130"/>
            <circle cx="90" cy="90" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="250,70 250,110 310,110 310,160"/>
            <circle cx="310" cy="110" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="60,240 120,240 120,280 200,280"/>
            <circle cx="120" cy="240" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="280,220 340,220 340,260 380,260"/>
            <circle cx="340" cy="220" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="20,460 80,460 80,510 140,510 140,560"/>
            <circle cx="80" cy="460" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <circle cx="140" cy="510" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="300,430 360,430 360,480 400,480"/>
            <circle cx="360" cy="430" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="50,620 110,620 110,670 170,670"/>
            <circle cx="110" cy="620" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <polyline points="270,600 330,600 330,650 390,650 390,700"/>
            <circle cx="330" cy="600" r="2.5" fill="#38bdf8" opacity="0.8"/>
            <circle cx="390" cy="650" r="2.5" fill="#38bdf8" opacity="0.8"/>
          </g>
        </svg>

        {/* Twinkling sparkle stars */}
        {[
          { cx: 12, cy: 8,  s: 7,  dur: '2.8s', delay: '0s'   },
          { cx: 88, cy: 5,  s: 5,  dur: '3.5s', delay: '0.6s' },
          { cx: 45, cy: 18, s: 9,  dur: '2.2s', delay: '1.1s' },
          { cx: 72, cy: 22, s: 6,  dur: '4s',   delay: '0.3s' },
          { cx: 25, cy: 35, s: 5,  dur: '3.2s', delay: '1.8s' },
          { cx: 91, cy: 40, s: 8,  dur: '2.6s', delay: '0.9s' },
          { cx: 60, cy: 48, s: 5,  dur: '3.8s', delay: '0.4s' },
          { cx: 8,  cy: 55, s: 9,  dur: '2.4s', delay: '1.4s' },
          { cx: 78, cy: 62, s: 7,  dur: '3s',   delay: '0.7s' },
          { cx: 38, cy: 70, s: 5,  dur: '4.2s', delay: '0.2s' },
          { cx: 95, cy: 75, s: 8,  dur: '2.9s', delay: '1.6s' },
          { cx: 18, cy: 82, s: 5,  dur: '3.4s', delay: '0.5s' },
          { cx: 55, cy: 88, s: 9,  dur: '2.7s', delay: '1.2s' },
          { cx: 82, cy: 92, s: 6,  dur: '3.6s', delay: '0.8s' },
          { cx: 33, cy: 96, s: 5,  dur: '2.5s', delay: '1.9s' },
        ].map(({ cx, cy, s, dur, delay }, i) => (
          <div
            key={i}
            className="dot-twinkle absolute"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              width: `${s}px`,
              height: `${s}px`,
              '--dur': dur,
              '--delay': delay,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 20 20" width={s} height={s} xmlns="http://www.w3.org/2000/svg" overflow="visible">
              <defs>
                <filter id={`glow-${i}`} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="2.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* 4-point sparkle: two thin diamond shapes rotated 45° */}
              <path
                d="M10 0 L11.2 8.8 L20 10 L11.2 11.2 L10 20 L8.8 11.2 L0 10 L8.8 8.8 Z"
                fill="white"
                filter={`url(#glow-${i})`}
              />
            </svg>
          </div>
        ))}

        {/* Central purple radial glow */}
        <div
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '38%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(109,40,217,0.35) 0%, rgba(76,29,149,0.15) 45%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />
      </div>

      {/* === Content (above background) === */}

      {/* Header row with stats + settings links */}
      <div className="w-full flex justify-between items-center relative z-10">
        <Link
          to="/settings"
          className="text-[#8b8fa8] hover:text-white transition-colors"
          aria-label="App Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
        <Link
          to="/stats"
          className="text-[#8b8fa8] text-sm hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          {stats.totalGames > 0 && <span>{stats.totalGames} games</span>}
        </Link>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center gap-6 animate-scale-in relative z-10">
        {/* Logo */}
        <div className="w-52 h-52 flex items-center justify-center relative">
          {/* Glow ring behind logo */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
              filter: 'blur(16px)',
              transform: 'scale(1.15)',
            }}
          />
          <img
            src="/logo.png"
            alt="Imposter"
            className="w-full h-full object-cover rounded-3xl relative"
            style={{ boxShadow: '0 0 40px rgba(109,40,217,0.5), 0 0 80px rgba(76,29,149,0.25)' }}
          />
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: '0 0 30px rgba(124,58,237,0.6)' }}>{t('home', 'title')}</h1>
          <p className="text-2xl font-semibold text-purple-400 mt-1">{t('home', 'subtitle')}</p>
          <p className="text-[#8b8fa8] text-sm mt-3 leading-relaxed max-w-xs">
            {t('home', 'tagline')}
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="w-full flex flex-col gap-3 animate-fade-in-up relative z-10">
        <Link
          to="/players"
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
          style={{ boxShadow: '0 0 24px rgba(124,58,237,0.45)' }}
        >
          {t('home', 'getStarted')}
        </Link>
        <Link
          to="/how-to-play"
          className="w-full bg-[#151829] border border-white/15 hover:bg-[#1e2138] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
        >
          {t('home', 'howToPlay')}
        </Link>
      </div>
    </div>
  )
}

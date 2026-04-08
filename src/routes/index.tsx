import { createFileRoute, Link } from '@tanstack/react-router'
import { getStats, getSettings } from '../lib/storage'
import { useTranslation } from '../hooks/useTranslation'

export const Route = createFileRoute('/')({
  component: HomeScreen,
})

function HomeScreen() {
  const settings = getSettings()
  const stats = getStats()
  const { t } = useTranslation(settings.defaultLanguage)

  return (
    <div className="min-h-svh flex flex-col items-center justify-between px-6 py-12 bg-[#0d0f1e]">
      {/* Header row with stats link */}
      <div className="w-full flex justify-end">
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
      <div className="flex flex-col items-center gap-6 animate-scale-in">
        {/* Hooded figure SVG */}
        <div className="w-52 h-52 flex items-center justify-center">
          <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
            <ellipse cx="100" cy="165" rx="70" ry="18" fill="#7c3aed" opacity="0.25" />
            <path d="M42 220 C42 182 62 162 100 157 C138 162 158 182 158 220Z" fill="#0f0b1e" />
            <path d="M42 220 C42 182 62 162 100 157 C138 162 158 182 158 220Z" fill="url(#bodyGrad)" />
            <path d="M57 112 C52 72 72 32 100 27 C128 32 148 72 143 112 C138 132 128 147 113 152 L100 157 L87 152 C72 147 62 132 57 112Z" fill="#080514" />
            <path d="M57 112 C52 72 72 32 100 27 C128 32 148 72 143 112 C138 132 128 147 113 152 L100 157 L87 152 C72 147 62 132 57 112Z" fill="url(#hoodGrad)" />
            <path d="M57 112 C52 72 72 32 100 27 C128 32 148 72 143 112 C138 132 128 147 113 152 L100 157 L87 152 C72 147 62 132 57 112Z" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.9"/>
            <ellipse cx="100" cy="100" rx="27" ry="31" fill="#040210" opacity="0.95"/>
            <defs>
              <linearGradient id="bodyGrad" x1="42" y1="157" x2="158" y2="220" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.35"/>
                <stop offset="1" stopColor="#5b21b6" stopOpacity="0.08"/>
              </linearGradient>
              <linearGradient id="hoodGrad" x1="57" y1="27" x2="143" y2="157" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.25"/>
                <stop offset="0.5" stopColor="#080514" stopOpacity="0"/>
                <stop offset="1" stopColor="#7c3aed" stopOpacity="0.18"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight">Imposter</h1>
          <p className="text-2xl font-semibold text-purple-400 mt-1">{t('home', 'subtitle')}</p>
          <p className="text-[#8b8fa8] text-sm mt-3 leading-relaxed max-w-xs">
            {t('home', 'tagline')}
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="w-full flex flex-col gap-3 animate-fade-in-up">
        <Link
          to="/players"
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
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

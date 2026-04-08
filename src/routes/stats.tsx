import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { getStats, clearStats, getPlayers, getSettings } from '../lib/storage'
import { useTranslation } from '../hooks/useTranslation'
import { PlayerAvatar } from '../components/PlayerAvatar'

export const Route = createFileRoute('/stats')({
  component: StatsScreen,
})

function StatsScreen() {
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const players = getPlayers()
  const [stats, setStats] = useState(() => getStats())
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    clearStats()
    setStats({ totalGames: 0, playerStats: {} })
    setConfirmClear(false)
  }

  // Build a merged list of player stats with names
  const playerStatsWithNames = players
    .map((p) => ({
      player: p,
      stats: stats.playerStats[p.id] ?? {
        gamesPlayed: 0,
        timesImposter: 0,
        timesCaught: 0,
        timesSurvived: 0,
      },
    }))
    .filter((entry) => entry.stats.gamesPlayed > 0)
    .sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed)

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <Link to="/" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{t('stats', 'title')}</h1>
        <button
          onClick={() => setConfirmClear(true)}
          className="text-[#8b8fa8] hover:text-red-400 text-xs transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Total games */}
      <div className="px-5 mb-5">
        <div className="bg-[#151829] border border-white/6 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <p className="text-[#8b8fa8] text-xs">{t('stats', 'totalGames')}</p>
            <p className="text-white text-3xl font-black">{stats.totalGames}</p>
          </div>
        </div>
      </div>

      {/* Player stats */}
      <div className="flex-1 px-5 overflow-y-auto pb-10">
        {playerStatsWithNames.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-[#8b8fa8] text-sm">{t('stats', 'noStats')}</p>
            <Link to="/players" className="text-purple-400 font-semibold mt-4 text-sm">
              Start Playing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[#8b8fa8] text-xs font-semibold uppercase tracking-wider mb-1">
              {t('stats', 'playerStats')}
            </p>
            {playerStatsWithNames.map(({ player, stats: ps }) => (
              <div key={player.id} className="bg-[#151829] border border-white/6 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <PlayerAvatar name={player.name} size="md" />
                  <div>
                    <p className="text-white font-bold">{player.name}</p>
                    <p className="text-[#8b8fa8] text-xs">
                      {player.language === 'en' ? 'English' : 'नेपाली'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: t('stats', 'gamesPlayed'), value: ps.gamesPlayed, color: 'text-white' },
                    { label: t('stats', 'timesImposter'), value: ps.timesImposter, color: 'text-red-400' },
                    { label: t('stats', 'timesCaught'), value: ps.timesCaught, color: 'text-amber-400' },
                    { label: t('stats', 'timesSurvived'), value: ps.timesSurvived, color: 'text-cyan-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center bg-[#0d0f1e] rounded-xl p-2">
                      <p className={`${stat.color} text-xl font-black`}>{stat.value}</p>
                      <p className="text-[#8b8fa8] text-[10px] leading-tight mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm clear modal */}
      {confirmClear && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setConfirmClear(false)}>
          <div
            className="w-full max-w-md mx-auto bg-[#151829] rounded-t-3xl p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-2">Clear Stats</h3>
            <p className="text-[#8b8fa8] text-sm mb-6">{t('stats', 'confirmClear')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-[#8b8fa8] font-semibold"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

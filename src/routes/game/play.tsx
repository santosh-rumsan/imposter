import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getCurrentGame, saveCurrentGame, getSettings } from '../../lib/storage'
import { useTranslation } from '../../hooks/useTranslation'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/game/play')({
  component: PlayScreen,
})

function PlayScreen() {
  const navigate = useNavigate()
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const [game, setGame] = useState(() => getCurrentGame())

  if (!game) {
    return (
      <div className="min-h-svh bg-[#0d0f1e] flex flex-col items-center justify-center gap-4">
        <p className="text-[#8b8fa8]">No active game.</p>
        <Link to="/" className="text-purple-400 font-semibold">Go Home</Link>
      </div>
    )
  }

  const allRevealed = game.players.every((p) => p.hasRevealed)

  function goToDiscussion() {
    if (!game) return
    if (!settings.timerEnabled) {
      const updated = { ...game, phase: 'voting' as const }
      saveCurrentGame(updated)
      navigate({ to: '/game/vote' })
    } else {
      const updated = { ...game, phase: 'discussion' as const }
      saveCurrentGame(updated)
      navigate({ to: '/game/discussion' })
    }
  }

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-6">
        <Link to="/game/settings" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">{t('play', 'title')}</h1>
        </div>
        <div className="w-6" />
      </div>

      <p className="text-[#8b8fa8] text-sm text-center px-8 mb-6 leading-relaxed">
        {t('play', 'instruction')}
      </p>

      {/* Player grid */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {game.players.map((player) => {
            const revealed = player.hasRevealed
            return (
              <button
                key={player.id}
                onClick={() => !revealed && navigate({ to: '/game/reveal/$playerId', params: { playerId: player.id } })}
                disabled={revealed}
                className={cn(
                  'flex flex-col items-center gap-3 bg-[#151829] rounded-2xl p-5 border transition-all active:scale-95',
                  revealed
                    ? 'border-white/5 opacity-50'
                    : 'border-purple-500/40 hover:border-purple-500/70 cursor-pointer'
                )}
              >
                {/* Avatar circle */}
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white',
                  revealed
                    ? 'bg-gradient-to-br from-gray-600 to-gray-700'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600'
                )}>
                  {revealed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    player.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className={cn(
                  'text-sm font-semibold',
                  revealed ? 'text-white/40' : 'text-white'
                )}>
                  {player.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Start Discussion button */}
      {allRevealed && (
        <div className="px-5 pb-10 pt-6 animate-fade-in-up">
          <p className="text-center text-[#8b8fa8] text-sm mb-4">{t('play', 'allRevealed')}</p>
          <button
            onClick={goToDiscussion}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
          >
            {t('play', 'startDiscussion')} →
          </button>
        </div>
      )}

      {!allRevealed && (
        <div className="px-5 pb-10 pt-4">
          <div className="flex items-center justify-center gap-2">
            {game.players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  p.hasRevealed ? 'bg-purple-400' : 'bg-white/20'
                )}
              />
            ))}
          </div>
          <p className="text-center text-[#8b8fa8] text-xs mt-2">
            {game.players.filter((p) => p.hasRevealed).length} / {game.players.length} revealed
          </p>
        </div>
      )}
    </div>
  )
}

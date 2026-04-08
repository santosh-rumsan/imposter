import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  getCurrentGame,
  saveCurrentGame,
  getSettings,
  getPlayers,
} from '../../lib/storage'
import { getGameResult, recordGameResult, createGame } from '../../lib/game-logic'
import { useTranslation } from '../../hooks/useTranslation'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/game/results')({
  component: ResultsScreen,
})

function ResultsScreen() {
  const navigate = useNavigate()
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const [game] = useState(() => getCurrentGame())
  const [recorded, setRecorded] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!game || recorded) return
    const { imposterWins } = getGameResult(game)
    const isVerbal = settings.votingMode === 'verbal' && Object.keys(game.votes).length === 0
    recordGameResult(game, isVerbal ? false : imposterWins, getPlayers())
    setRecorded(true)
    setShowDetails(true)
  }, [game])

  if (!game) {
    return (
      <div className="min-h-svh bg-[#0d0f1e] flex flex-col items-center justify-center">
        <Link to="/" className="text-purple-400 font-semibold">Go Home</Link>
      </div>
    )
  }

  const { imposterWins, voteTargetId } = getGameResult(game)
  const isVerbalNoVotes = settings.votingMode === 'verbal' && Object.keys(game.votes).length === 0
  const imposters = game.players.filter((p) => p.isImposter)
  const imposterNames = imposters.map((p) => p.name).join(', ')

  const voteCounts: Record<string, number> = {}
  Object.values(game.votes).forEach((targetId) => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })

  function playAgain() {
    if (!game) return
    const players = getPlayers()
    const newGame = createGame(players, settings)
    saveCurrentGame(newGame)
    navigate({ to: '/game/play' })
  }

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col px-6 py-12">
      {/* Result banner */}
      <div className={cn(
        'rounded-2xl p-8 text-center mb-6 border-2 animate-scale-in',
        isVerbalNoVotes
          ? 'bg-surface border-white/20'
          : imposterWins
          ? 'bg-red-950/50 border-red-500/60'
          : 'bg-purple-950/50 border-purple-500/60'
      )}>
        <div className="text-5xl mb-3">{isVerbalNoVotes ? '🕵️' : imposterWins ? '🕵️' : '🎉'}</div>
        <h1 className={cn(
          'text-3xl font-black',
          isVerbalNoVotes ? 'text-white/80' : imposterWins ? 'text-red-400' : 'text-purple-400'
        )}>
          {isVerbalNoVotes ? t('results', 'gameOver') : imposterWins ? t('results', 'imposterWins') : t('results', 'citizensWin')}
        </h1>
      </div>

      {showDetails && (
        <div className="flex flex-col gap-4 animate-fade-in-up flex-1">
          {/* Imposter reveal */}
          <div className="bg-[#151829] border border-white/6 rounded-2xl p-5">
            <p className="text-[#8b8fa8] text-xs mb-3">
              {imposters.length > 1 ? t('results', 'theImpostersWere') : t('results', 'theImposterwas')}
            </p>
            {imposters.map((imp) => (
              <div key={imp.id} className="flex items-center gap-3 mb-2">
                <PlayerAvatar name={imp.name} size="sm" />
                <span className="text-red-400 font-bold text-lg">{imp.name}</span>
              </div>
            ))}
          </div>

          {/* Secret word */}
          <div className="bg-[#151829] border border-white/6 rounded-2xl p-5 text-center">
            <p className="text-[#8b8fa8] text-xs mb-2">{t('results', 'secretWord')}</p>
            <p className="text-cyan-400 text-3xl font-black">{game.secretWordLocalized?.[settings.defaultLanguage] ?? game.secretWord}</p>
            <p className="text-[#8b8fa8] text-xs mt-1">{game.categoryLocalized?.[settings.defaultLanguage] ?? game.category}</p>
          </div>

          {/* Vote tally */}
          {Object.keys(voteCounts).length > 0 && (
            <div className="bg-[#151829] border border-white/6 rounded-2xl p-5">
              <p className="text-[#8b8fa8] text-xs mb-3">{t('results', 'votes')}</p>
              {game.players.map((p) => {
                const count = voteCounts[p.id] || 0
                const pct = game.players.length > 0 ? count / (game.players.length - 1) : 0
                return (
                  <div key={p.id} className="flex items-center gap-3 mb-2">
                    <PlayerAvatar name={p.name} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          'text-sm font-medium',
                          p.isImposter ? 'text-red-400' : 'text-white/80'
                        )}>
                          {p.name}
                          {p.isImposter && ' 🕵️'}
                        </span>
                        <span className="text-[#8b8fa8] text-xs">{count} votes</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            p.isImposter ? 'bg-red-500' : 'bg-purple-500'
                          )}
                          style={{ width: `${pct * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-6 pb-4">
        <button
          onClick={playAgain}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
        >
          {t('results', 'playAgain')} →
        </button>
        <Link
          to="/"
          onClick={() => saveCurrentGame(null)}
          className="w-full bg-[#151829] border border-white/15 hover:bg-[#1e2138] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
        >
          {t('results', 'newGame')}
        </Link>
      </div>
    </div>
  )
}

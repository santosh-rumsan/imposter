import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getCurrentGame, saveCurrentGame, getSettings } from '../../lib/storage'
import { castVote, skipToResults } from '../../lib/game-logic'
import { useTranslation } from '../../hooks/useTranslation'
import { PlayerAvatar } from '../../components/PlayerAvatar'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/game/vote')({
  component: VoteScreen,
})

function VoteScreen() {
  const navigate = useNavigate()
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const [game, setGame] = useState(() => getCurrentGame())
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  const nonVotedPlayers = game ? game.players.filter((p) => !p.hasVoted) : []
  const currentVoter = nonVotedPlayers[0] ?? null
  const allVoted = game ? game.players.every((p) => p.hasVoted) : false

  useEffect(() => {
    if (!game) {
      navigate({ to: '/' })
      return
    }
    if (allVoted && game.phase !== 'results') {
      const updated = skipToResults(game)
      saveCurrentGame(updated)
      navigate({ to: '/game/results' })
    }
  }, [game, allVoted])

  if (!game) return null

  function confirmVote() {
    if (!game || !currentVoter || !selectedTarget) return
    const updated = castVote(game, currentVoter.id, selectedTarget)
    saveCurrentGame(updated)
    setGame(updated)
    setSelectedTarget(null)
    if (updated.phase === 'results') {
      navigate({ to: '/game/results' })
    }
  }

  function skipVerbal() {
    if (!game) return
    const updated = skipToResults(game)
    saveCurrentGame(updated)
    navigate({ to: '/game/results' })
  }

  if (settings.votingMode === 'verbal') {
    return (
      <div className="min-h-svh bg-[#0d0f1e] flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white mb-2">{t('vote', 'title')}</h1>
          <p className="text-[#8b8fa8]">Vote verbally amongst yourselves!</p>
        </div>
        <button
          onClick={skipVerbal}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
        >
          {t('vote', 'revealResults')} →
        </button>
      </div>
    )
  }

  if (!currentVoter) {
    return (
      <div className="min-h-svh bg-[#0d0f1e] flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-white font-bold text-xl">{t('vote', 'allVoted')}</p>
        <button
          onClick={() => navigate({ to: '/game/results' })}
          className="w-full bg-[#7c3aed] text-white font-bold py-4 rounded-full"
        >
          {t('vote', 'revealResults')}
        </button>
      </div>
    )
  }

  const votableTargets = game.players.filter((p) => p.id !== currentVoter.id)
  const remainingVoters = nonVotedPlayers.length

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col px-6 py-12">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-white">{t('vote', 'title')}</h1>
        <p className="text-[#8b8fa8] text-sm mt-1">
          {remainingVoters} voter{remainingVoters > 1 ? 's' : ''} remaining
        </p>
      </div>

      {/* Current voter */}
      <div className="bg-[#151829] border border-purple-500/40 rounded-2xl px-5 py-4 mb-6 text-center">
        <p className="text-[#8b8fa8] text-xs mb-2">{t('vote', 'passInstruction')}</p>
        <p className="text-white font-bold text-xl">{currentVoter.name}</p>
        <p className="text-purple-400 text-sm mt-1">{t('vote', 'instruction')}</p>
      </div>

      {/* Voting targets */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {votableTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => setSelectedTarget(selectedTarget === target.id ? null : target.id)}
              className={cn(
                'flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all active:scale-[0.98]',
                selectedTarget === target.id
                  ? 'bg-purple-600/20 border-purple-500 text-white'
                  : 'bg-[#151829] border-white/6 text-white/80'
              )}
            >
              <PlayerAvatar name={target.name} size="md" />
              <span className="font-semibold text-lg flex-1 text-left">{target.name}</span>
              {selectedTarget === target.id && (
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <div className="pb-4 pt-4">
        <button
          onClick={confirmVote}
          disabled={!selectedTarget}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
        >
          {t('vote', 'confirmVote')}
        </button>
      </div>
    </div>
  )
}

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getCurrentGame, saveCurrentGame, getSettings } from '../../lib/storage'
import { markRevealed } from '../../lib/game-logic'
import { useTranslation } from '../../hooks/useTranslation'
import { ParticleCard } from '../../components/ParticleCard'
import type { Language } from '../../lib/storage'

export const Route = createFileRoute('/game/reveal/$playerId')({
  component: RevealScreen,
})

function RevealScreen() {
  const { playerId } = Route.useParams()
  const navigate = useNavigate()
  const settings = getSettings()
  const game = getCurrentGame()
  const [revealed, setRevealed] = useState(false)

  const player = game?.players.find((p) => p.id === playerId)
  const lang: Language = player?.language ?? settings.defaultLanguage
  const { t } = useTranslation(lang)
  const langClass = lang === 'ne' ? 'lang-ne' : ''

  if (!game) {
    navigate({ to: '/' })
    return null
  }

  if (!player) {
    navigate({ to: '/game/play' })
    return null
  }

  function handleReveal() {
    setRevealed(true)
  }

  function handleGotIt() {
    if (!game) return
    const updatedGame = markRevealed(game, playerId)
    saveCurrentGame(updatedGame)
    navigate({ to: '/game/play' })
  }

  const showHint = player.isImposter && settings.showHintToImposter && game.hint
  const showCategory = player.isImposter && settings.showCategoryToImposter
  const otherImposters = player.isImposter && settings.impostersKnowEachOther
    ? game.players.filter((p) => p.isImposter && p.id !== playerId)
    : []

  // Localized word/hint/category for this player's language
  const localizedWord = game.secretWordLocalized?.[lang] ?? game.secretWord
  const localizedHint = game.hintLocalized?.[lang] ?? game.hint
  const localizedCategory = game.categoryLocalized?.[lang] ?? game.category

  return (
    <div className={`min-h-svh bg-[#0d0f1e] flex flex-col px-6 py-12 ${langClass}`}>
      {/* Player name header */}
      <div className="text-center mb-10">
        <p className="text-white/60 text-xl font-medium">
          {t('reveal', 'wordFor')}{' '}
          <span className="text-purple-300 font-bold">{player.name}</span>
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5">
        {/* Main card */}
        {!revealed ? (
          <div>
            <ParticleCard onClick={handleReveal} />
            <p className="text-center text-cyan-400 text-sm mt-4 font-medium flex items-center justify-center gap-2">
              <span>👆</span>
              {t('reveal', 'tapToReveal')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Category above card (non-imposter only) */}
            {!player.isImposter && (
              <div className="text-center">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{t('reveal', 'category')}</p>
                <p className="text-3xl font-black text-purple-300 tracking-wide">{localizedCategory}</p>
              </div>
            )}

            {/* Word/Imposter card */}
            {player.isImposter ? (
              <div className="w-full rounded-2xl bg-[#1a0a0a] border-2 border-red-500 glow-red flex items-center justify-center py-14">
                <span className="text-4xl font-black text-red-400 tracking-wide">
                  {t('reveal', 'imposter')}
                </span>
              </div>
            ) : (
              <div className="w-full rounded-2xl bg-[#151829] border border-white/10 flex items-center justify-center py-14">
                <span className="text-4xl font-black text-cyan-400 tracking-wide text-center px-4">
                  {localizedWord}
                </span>
              </div>
            )}

            {/* Category for imposter (if enabled) */}
            {player.isImposter && showCategory && (
              <div className="bg-[#151829] border border-white/10 rounded-xl px-5 py-3 text-center">
                <p className="text-[#8b8fa8] text-xs mb-1">{t('reveal', 'category')}</p>
                <p className="text-white font-bold">{localizedCategory}</p>
              </div>
            )}

            {/* Hint card for imposter */}
            {showHint && (
              <div className="bg-[#1a0f05] border border-amber-600/40 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span className="text-amber-400 font-semibold text-sm">{t('reveal', 'yourClue')}</span>
                </div>
                <p className="text-white text-2xl font-black text-center tracking-widest mb-2">{localizedHint}</p>
                <p className="text-white/50 text-xs text-center">{t('reveal', 'clueHint')}</p>
              </div>
            )}

            {/* Other imposters (know each other) */}
            {otherImposters.length > 0 && (
              <div className="bg-[#1a0a0a] border border-red-500/40 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="text-red-400 font-semibold text-sm">Your fellow imposters</span>
                </div>
                <div className="flex flex-col gap-2">
                  {otherImposters.map((imp) => (
                    <div key={imp.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-white font-bold">{imp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Got it button */}
      {revealed && (
        <div className="animate-fade-in-up pb-4">
          <button
            onClick={handleGotIt}
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
          >
            {t('reveal', 'gotIt')}
          </button>
        </div>
      )}
    </div>
  )
}

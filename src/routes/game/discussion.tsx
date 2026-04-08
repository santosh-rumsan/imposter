import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getCurrentGame, saveCurrentGame, getSettings } from '../../lib/storage'
import { useTranslation } from '../../hooks/useTranslation'
import { useTimer } from '../../hooks/useTimer'
import { TimerRing } from '../../components/TimerRing'

export const Route = createFileRoute('/game/discussion')({
  component: DiscussionScreen,
})

function DiscussionScreen() {
  const navigate = useNavigate()
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const game = getCurrentGame()
  const [timerStarted, setTimerStarted] = useState(false)

  const timer = useTimer(settings.timerDuration, settings.timerEnabled, false)

  if (!game) {
    navigate({ to: '/' })
    return null
  }

  function goToVote() {
    if (!game) return
    const updated = { ...game, phase: 'voting' as const }
    saveCurrentGame(updated)
    navigate({ to: '/game/vote' })
  }

  function handleStartTimer() {
    setTimerStarted(true)
    timer.start()
  }

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/game/play" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{t('discussion', 'title')}</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Category badge */}
        <div className="bg-[#151829] border border-purple-500/30 rounded-2xl px-6 py-4 text-center">
          <p className="text-[#8b8fa8] text-xs mb-1">{t('discussion', 'category')}</p>
          <p className="text-white font-bold text-xl">{game.categoryLocalized?.[settings.defaultLanguage] ?? game.category}</p>
        </div>

        {/* Timer */}
        {settings.timerEnabled && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <TimerRing
                progress={timer.progress}
                formatted={timer.formatted}
                size={160}
                isExpired={timer.isExpired}
              />
              <div className="absolute text-3xl font-bold" style={{ color: timer.isExpired ? '#ef4444' : timer.progress > 0.5 ? '#7c3aed' : timer.progress > 0.25 ? '#f59e0b' : '#ef4444' }}>
                {timer.formatted}
              </div>
            </div>
            {!timerStarted ? (
              <button
                onClick={handleStartTimer}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-all active:scale-95"
              >
                Start Timer
              </button>
            ) : timer.isExpired ? (
              <p className="text-red-400 font-bold text-lg animate-pulse">{t('discussion', 'timeUp')}</p>
            ) : (
              <button
                onClick={timer.pause}
                className="text-[#8b8fa8] hover:text-white text-sm transition-colors"
              >
                Pause
              </button>
            )}
          </div>
        )}

        {/* Instruction */}
        <div className="text-center max-w-xs">
          <p className="text-white/80 text-base leading-relaxed">{t('discussion', 'instruction')}</p>
        </div>
      </div>

      {/* Go to Vote */}
      <div className="pb-4">
        <button
          onClick={goToVote}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
        >
          {t('discussion', 'goToVote')} →
        </button>
      </div>
    </div>
  )
}

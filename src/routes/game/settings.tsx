import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  getSettings,
  saveSettings,
  getPlayers,
  saveCurrentGame,
} from '../../lib/storage'
import type { Settings, Region, Language } from '../../lib/storage'
import { useTranslation } from '../../hooks/useTranslation'
import { createGame, getImposterCount } from '../../lib/game-logic'
import { cn } from '../../lib/utils'

export const Route = createFileRoute('/game/settings')({
  component: GameSettingsScreen,
})

function Toggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-purple-400">{icon}</span>
        <span className="text-white/90 text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-all duration-200',
          checked ? 'bg-purple-600' : 'bg-white/15'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
            checked ? 'left-6' : 'left-0.5'
          )}
        />
      </button>
    </div>
  )
}

export default function GameSettingsScreen() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<Settings>(() => getSettings())
  const players = getPlayers()
  const { t } = useTranslation(settings.defaultLanguage)

  const imposterCount = getImposterCount(players.length, settings.imposterCountOverride)

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveSettings(updated)
  }

  function startGame() {
    const game = createGame(players, settings)
    saveCurrentGame(game)
    navigate({ to: '/game/play' })
  }

  const regions: { key: Region; label: string }[] = [
    { key: 'us', label: t('settings', 'us') },
    { key: 'nepal', label: t('settings', 'nepal') },
    { key: 'world', label: t('settings', 'world') },
  ]

  const langs: { key: Language; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'ne', label: 'नेपाली' },
  ]

  const timerOptions = [1, 2, 3, 4, 5]

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Link to="/players" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{t('settings', 'title')}</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-4">
        {/* Player / Imposter count cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#151829] rounded-2xl p-4 border border-white/6 flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className="text-[#8b8fa8] text-xs">{t('settings', 'howManyPlayers')}</p>
            <p className="text-white text-3xl font-black">{players.length}</p>
          </div>
          <div className="bg-[#151829] rounded-2xl p-4 border border-white/6 flex flex-col gap-1">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11l2 2 4-4"/>
              </svg>
            </div>
            <p className="text-[#8b8fa8] text-xs">{t('settings', 'howManyImposters')}</p>
            <p className="text-white text-3xl font-black">{imposterCount}</p>
          </div>
        </div>

        {/* Game Mode */}
        <div>
          <p className="text-[#8b8fa8] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            {t('settings', 'gameMode')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1e2138] border-2 border-purple-500 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-purple-400 mb-1">Tt</div>
              <p className="text-purple-400 font-bold text-sm">{t('settings', 'wordGame')}</p>
              <p className="text-[#8b8fa8] text-xs mt-1">{t('settings', 'wordGameDesc')}</p>
            </div>
            <div className="bg-[#151829] border border-white/10 rounded-2xl p-4 text-center opacity-50">
              <div className="text-2xl mb-1 text-[#8b8fa8]">?</div>
              <p className="text-white font-bold text-sm">{t('settings', 'questionGame')}</p>
              <p className="text-[#8b8fa8] text-xs mt-1">{t('settings', 'questionGameDesc')}</p>
            </div>
          </div>
        </div>

        {/* Region */}
        <div>
          <p className="text-[#8b8fa8] text-xs font-semibold uppercase tracking-wider mb-2">
            {t('settings', 'region')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {regions.map((r) => (
              <button
                key={r.key}
                onClick={() => update('region', r.key)}
                className={cn(
                  'py-3 rounded-xl font-semibold text-sm transition-all border',
                  settings.region === r.key
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-[#151829] border-white/10 text-[#8b8fa8] hover:text-white'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories toggles */}
        <div className="bg-[#151829] border border-white/6 rounded-2xl px-4">
          <div className="flex items-center justify-between py-3 border-b border-white/6">
            <span className="text-white font-semibold text-sm">{t('settings', 'allCategories')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b8fa8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div className="divide-y divide-white/6">
            <Toggle
              checked={settings.showCategoryToImposter}
              onChange={(v) => update('showCategoryToImposter', v)}
              label={t('settings', 'showCategoryToImposter')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
            />
            <Toggle
              checked={settings.showHintToImposter}
              onChange={(v) => update('showHintToImposter', v)}
              label={t('settings', 'showHintToImposter')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            />
            <Toggle
              checked={settings.impostersKnowEachOther}
              onChange={(v) => update('impostersKnowEachOther', v)}
              label={t('settings', 'impostersKnowEachOther')}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="bg-[#151829] border border-white/6 rounded-2xl px-4">
          <Toggle
            checked={settings.timerEnabled}
            onChange={(v) => update('timerEnabled', v)}
            label={t('settings', 'timer')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          {settings.timerEnabled && (
            <div className="pb-3">
              <div className="grid grid-cols-5 gap-1.5">
                {timerOptions.map((min) => (
                  <button
                    key={min}
                    onClick={() => update('timerDuration', min * 60)}
                    className={cn(
                      'py-2 rounded-xl text-sm font-bold transition-all',
                      settings.timerDuration === min * 60
                        ? 'bg-purple-600 text-white'
                        : 'bg-[#1e2138] text-[#8b8fa8]'
                    )}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Voting Mode */}
        <div className="bg-[#151829] border border-white/6 rounded-2xl px-4 py-3">
          <p className="text-[#8b8fa8] text-xs mb-2">{t('settings', 'votingMode')}</p>
          <div className="grid grid-cols-2 gap-2">
            {(['in-app', 'verbal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => update('votingMode', mode)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold transition-all border',
                  settings.votingMode === mode
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-[#1e2138] border-white/10 text-[#8b8fa8]'
                )}
              >
                {mode === 'in-app' ? t('settings', 'inApp') : t('settings', 'verbal')}
              </button>
            ))}
          </div>
        </div>

        {/* Default Language */}
        <div className="bg-[#151829] border border-white/6 rounded-2xl px-4 py-3">
          <p className="text-[#8b8fa8] text-xs mb-2">{t('settings', 'defaultLanguage')}</p>
          <div className="grid grid-cols-2 gap-2">
            {langs.map((l) => (
              <button
                key={l.key}
                onClick={() => update('defaultLanguage', l.key)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold transition-all border',
                  l.key === 'ne' ? 'lang-ne' : '',
                  settings.defaultLanguage === l.key
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-[#1e2138] border-white/10 text-[#8b8fa8]'
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Start Game button */}
      <div className="px-5 pb-10 pt-2">
        <button
          onClick={startGame}
          disabled={players.length < 3}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 text-white font-bold text-lg py-4 rounded-full transition-all active:scale-95"
        >
          {t('settings', 'startGame')}
        </button>
      </div>
    </div>
  )
}

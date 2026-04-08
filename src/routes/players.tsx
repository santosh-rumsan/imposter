import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getPlayers, savePlayers, getSettings, saveSettings } from '../lib/storage'
import type { Player, Language } from '../lib/storage'
import { generateId } from '../lib/utils'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useTranslation } from '../hooks/useTranslation'
import { getImposterCount } from '../lib/game-logic'

export const Route = createFileRoute('/players')({
  component: PlayersScreen,
})

function PlayersScreen() {
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)
  const navigate = useNavigate()

  const [players, setPlayers] = useState<Player[]>(() => getPlayers())
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLang, setNewLang] = useState<Language>(settings.defaultLanguage)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  function persistPlayers(updated: Player[]) {
    setPlayers(updated)
    savePlayers(updated)
  }

  function addPlayer() {
    const name = newName.trim()
    if (!name) return
    const newPlayer: Player = { id: generateId(), name, language: newLang }
    persistPlayers([...players, newPlayer])
    setNewName('')
    setShowAdd(false)
  }

  function confirmAndRemove() {
    if (!confirmRemoveId) return
    persistPlayers(players.filter((p) => p.id !== confirmRemoveId))
    setConfirmRemoveId(null)
  }

  const canStart = players.length >= 3
  const imposterCount = getImposterCount(players.length, settings.imposterCountOverride)

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Link to="/" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{t('players', 'title')}</h1>
        <Link to="/game/settings" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M12 2v2m0 16v2M2 12h2m16 0h2"/>
          </svg>
        </Link>
      </div>

      {/* Player count pill */}
      <div className="px-5 mb-3">
        <div className="flex items-center justify-between bg-surface2 border border-purple-500/40 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="text-white font-semibold">
              {players.length} {t('players', 'playerCount')}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{t('players', 'range')}</span>
            {players.length >= 3 && (
              <span className="text-purple-400 font-medium">
                {imposterCount} imposter{imposterCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player list */}
      <div className="flex-1 px-5 overflow-y-auto">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b8fa8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <p className="text-muted text-sm">{t('players', 'addFirst')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-[#151829] rounded-xl px-4 py-3 border border-white/6"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-300 font-bold text-sm">{player.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="flex-1 text-white font-medium">{player.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-white/15 text-muted">
                  {player.language === 'en' ? 'EN' : 'NE'}
                </span>
                <span className="text-xs text-muted bg-surface2 px-2 py-1 rounded-full">
                  #{index + 1}
                </span>
                <button
                  onClick={() => setConfirmRemoveId(player.id)}
                  className="text-white/30 hover:text-red-400 transition-colors ml-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add player form */}
      {showAdd && (
        <div className="px-5 pb-4 animate-fade-in-up">
          <div className="bg-[#151829] border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder={t('players', 'namePlaceholder')}
              autoFocus
              className="bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-purple-500/60 transition-colors"
            />
            {/* Language toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setNewLang('en')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  newLang === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'bg-surface2 text-muted border border-white/10'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setNewLang('ne')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all lang-ne ${
                  newLang === 'ne'
                    ? 'bg-purple-600 text-white'
                    : 'bg-surface2 text-muted border border-white/10'
                }`}
              >
                नेपाली
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 rounded-xl border border-white/15 text-muted font-semibold text-sm"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={addPlayer}
                disabled={!newName.trim()}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm disabled:opacity-40 transition-all"
              >
                {t('players', 'add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom action buttons */}
      <div className="px-5 pb-8 pt-3 flex gap-3">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            disabled={players.length >= 12}
            className="flex-1 py-4 rounded-full border-2 border-purple-500/60 text-purple-400 font-bold flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>
            </svg>
            {t('players', 'add')}
          </button>
        ) : null}
      </div>

      {/* Next button when enough players */}
      {canStart && (
        <div className="px-5 pb-10 animate-fade-in-up">
          <Link
            to="/game/settings"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
          >
            {t('players', 'next')} →
          </Link>
        </div>
      )}

      {/* Confirm remove modal */}
      {confirmRemoveId && (() => {
        const player = players.find((p) => p.id === confirmRemoveId)!
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-5">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmRemoveId(null)} />
            <div className="relative w-full bg-surface border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in-up">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">Remove Player?</p>
                <p className="text-muted text-sm mt-1">
                  <span className="text-white font-medium">{player.name}</span> will be removed from the game.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmRemoveId(null)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-muted font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndRemove}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  getSettings,
  getRecentWordsCount,
  clearAllCache,
  getWordPackMeta,
  getWordPackIndex,
} from '../lib/storage'
import { useTranslation } from '../hooks/useTranslation'
import { fetchAndCacheWordPack, fetchIndex } from '../lib/word-pack-loader'
import type { WordPackEntry } from '../lib/storage'

export const Route = createFileRoute('/settings')({
  component: AppSettingsScreen,
})

function AppSettingsScreen() {
  const navigate = useNavigate()
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)

  const [recentCount, setRecentCount] = useState(() => getRecentWordsCount())
  const [showConfirm, setShowConfirm] = useState(false)
  const [cleared, setCleared] = useState(false)
  const [packs, setPacks] = useState<WordPackEntry[]>(() => getWordPackIndex() ?? [])
  const [packMeta, setPackMeta] = useState(() => getWordPackMeta())
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})

  // Refresh index in background on mount
  useEffect(() => {
    fetchIndex().then((index) => {
      if (index) setPacks(index)
    })
  }, [])

  function handleClearCache() {
    clearAllCache()
    setRecentCount(0)
    setPackMeta({})
    setPacks([])
    setShowConfirm(false)
    setCleared(true)
    setTimeout(() => navigate({ to: '/' }), 1200)
  }

  async function handleDownloadPack(pack: WordPackEntry) {
    setRefreshing((prev) => ({ ...prev, [pack.id]: true }))
    await fetchAndCacheWordPack(pack)
    setPackMeta(getWordPackMeta())
    setRefreshing((prev) => ({ ...prev, [pack.id]: false }))
  }

  async function handleRefreshAll() {
    const toRefresh = packs.filter((p) => p.autoDownload || !!packMeta[p.id])
    const next: Record<string, boolean> = {}
    toRefresh.forEach((p) => (next[p.id] = true))
    setRefreshing(next)
    await Promise.all(toRefresh.map((p) => fetchAndCacheWordPack(p)))
    setPackMeta(getWordPackMeta())
    setRefreshing({})
  }

  const anyRefreshing = Object.values(refreshing).some(Boolean)

  return (
    <div className="min-h-svh bg-bg flex flex-col px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/"
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white">{t('appSettings', 'title')}</h1>
      </div>

      {/* Word Packs Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
            {t('appSettings', 'wordPacks')}
          </h2>
          {packs.length > 0 && (
            <button
              onClick={handleRefreshAll}
              disabled={anyRefreshing}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold disabled:opacity-40 transition-colors"
            >
              {anyRefreshing ? t('appSettings', 'refreshing') : t('appSettings', 'refreshAll')}
            </button>
          )}
        </div>

        {packs.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-2xl px-5 py-6 text-center text-muted text-sm">
            {t('appSettings', 'loadingPacks')}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {packs.map((pack) => {
              const meta = packMeta[pack.id]
              const isCached = !!meta
              const isRefreshing = !!refreshing[pack.id]

              return (
                <div
                  key={pack.id}
                  className="bg-surface border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4"
                >
                  <span className="text-3xl leading-none">{pack.flag}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">
                        {t('settings', pack.nameKey as 'us' | 'nepal' | 'world')}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          pack.bilingual
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {pack.bilingual ? t('appSettings', 'bilingual') : t('appSettings', 'englishOnly')}
                      </span>
                      {pack.autoDownload && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                          {t('appSettings', 'auto')}
                        </span>
                      )}
                    </div>

                    <p className="text-muted text-sm mt-0.5">
                      {pack.categories} {t('appSettings', 'categories')} · {pack.words} {t('appSettings', 'words')}
                    </p>

                    <p className="text-[10px] mt-1">
                      {isRefreshing ? (
                        <span className="text-yellow-400">{t('appSettings', 'downloading')}</span>
                      ) : isCached ? (
                        <span className="text-green-400">
                          {t('appSettings', 'cachedOn')} {new Date(meta.cachedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted">{t('appSettings', 'notCached')}</span>
                      )}
                    </p>
                  </div>

                  {/* Download / Refresh button */}
                  {isCached ? (
                    <button
                      onClick={() => handleDownloadPack(pack)}
                      disabled={isRefreshing}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                      title={t('appSettings', 'refresh')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isRefreshing ? 'animate-spin' : ''}
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadPack(pack)}
                      disabled={isRefreshing}
                      className="px-3 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 flex items-center gap-1.5 text-purple-300 text-xs font-semibold transition-colors shrink-0"
                    >
                      {isRefreshing ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      )}
                      {t('appSettings', 'download')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Cache Section */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
          {t('appSettings', 'cache')}
        </h2>
        <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
            <div>
              <p className="text-white font-medium text-sm">{t('appSettings', 'recentWords')}</p>
              <p className="text-muted text-xs mt-0.5">{t('appSettings', 'recentWordsDesc')}</p>
            </div>
            <span className="text-purple-300 font-bold text-lg tabular-nums">{recentCount}</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mt-auto">
        {cleared ? (
          <div className="w-full py-4 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-300 font-semibold text-center">
            {t('appSettings', 'cleared')}
          </div>
        ) : showConfirm ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-5 flex flex-col gap-4">
            <div>
              <p className="text-red-300 font-semibold text-base">{t('appSettings', 'confirmClear')}</p>
              <p className="text-muted text-sm mt-1">{t('appSettings', 'clearCacheDesc')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors active:scale-95"
              >
                {t('common', 'cancel')}
              </button>
              <button
                onClick={handleClearCache}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors active:scale-95"
              >
                {t('common', 'confirm')}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-semibold transition-all active:scale-95"
          >
            {t('appSettings', 'clearCache')}
          </button>
        )}
      </section>
    </div>
  )
}

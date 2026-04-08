export type Language = 'en' | 'ne'
export type Region = 'us' | 'nepal' | 'world'
export type VotingMode = 'in-app' | 'verbal'
export type GamePhase = 'reveal' | 'discussion' | 'voting' | 'results'

export interface Player {
  id: string
  name: string
  language: Language
}

export interface Settings {
  region: Region
  timerEnabled: boolean
  timerDuration: number // seconds
  votingMode: VotingMode
  defaultLanguage: Language
  showCategoryToImposter: boolean
  showHintToImposter: boolean
  impostersKnowEachOther: boolean
  imposterCountOverride: number | null
}

export interface GamePlayer extends Player {
  isImposter: boolean
  hasRevealed: boolean
  hasVoted: boolean
}

export interface LocalizedText {
  en: string
  ne: string
}

export interface CurrentGame {
  players: GamePlayer[]
  secretWord: string
  hint: string
  category: string
  secretWordLocalized: LocalizedText
  hintLocalized: LocalizedText
  categoryLocalized: LocalizedText
  region: Region
  imposters: string[] // player IDs
  phase: GamePhase
  votes: Record<string, string> // voterId → targetId
  timerStartedAt: number | null
}

export interface PlayerStats {
  gamesPlayed: number
  timesImposter: number
  timesCaught: number
  timesSurvived: number
}

export interface GameStats {
  totalGames: number
  playerStats: Record<string, PlayerStats>
}

export interface AppStorage {
  players: Player[]
  settings: Settings
  stats: GameStats
  currentGame: CurrentGame | null
}

const STORAGE_KEY = 'imposter_game'

const DEFAULT_SETTINGS: Settings = {
  region: 'world',
  timerEnabled: false,
  timerDuration: 180,
  votingMode: 'verbal',
  defaultLanguage: 'en',
  showCategoryToImposter: false,
  showHintToImposter: true,
  impostersKnowEachOther: false,
  imposterCountOverride: null,
}

const DEFAULT_STORAGE: AppStorage = {
  players: [],
  settings: DEFAULT_SETTINGS,
  stats: { totalGames: 0, playerStats: {} },
  currentGame: null,
}

function load(): AppStorage {
  if (typeof window === 'undefined') return DEFAULT_STORAGE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STORAGE }
    const parsed = JSON.parse(raw) as Partial<AppStorage>
    return {
      players: parsed.players ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      stats: parsed.stats ?? { totalGames: 0, playerStats: {} },
      currentGame: parsed.currentGame ?? null,
    }
  } catch {
    return { ...DEFAULT_STORAGE }
  }
}

function save(data: AppStorage): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getStorage(): AppStorage {
  return load()
}

export function getPlayers(): Player[] {
  return load().players
}

export function savePlayers(players: Player[]): void {
  const data = load()
  data.players = players
  save(data)
}

export function getSettings(): Settings {
  return load().settings
}

export function saveSettings(settings: Settings): void {
  const data = load()
  data.settings = settings
  save(data)
}

export function getStats(): GameStats {
  return load().stats
}

export function saveStats(stats: GameStats): void {
  const data = load()
  data.stats = stats
  save(data)
}

export function getCurrentGame(): CurrentGame | null {
  return load().currentGame
}

export function saveCurrentGame(game: CurrentGame | null): void {
  const data = load()
  data.currentGame = game
  save(data)
}

export function clearStats(): void {
  const data = load()
  data.stats = { totalGames: 0, playerStats: {} }
  save(data)
}

export function getRecentWords(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('imposter_recent_words')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addRecentWord(word: string): void {
  if (typeof window === 'undefined') return
  const recent = getRecentWords()
  const updated = [word, ...recent.filter((w) => w !== word)].slice(0, 30)
  localStorage.setItem('imposter_recent_words', JSON.stringify(updated))
}

export function clearAllCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem('imposter_recent_words')
  clearWordPackCache()
}

export function getRecentWordsCount(): number {
  return getRecentWords().length
}

// ── Word Pack Cache ──────────────────────────────────────────────────────────

const WORD_PACK_META_KEY = 'imposter_word_pack_meta'
const WORD_PACK_INDEX_KEY = 'imposter_word_pack_index'

export interface WordPackMeta {
  cachedAt: number
}

export interface WordPackEntry {
  id: string
  nameKey: string
  flag: string
  bilingual: boolean
  autoDownload: boolean
  url: string
  categories: number
  words: number
}

export function getWordPackIndex(): WordPackEntry[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(WORD_PACK_INDEX_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveWordPackIndex(entries: WordPackEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WORD_PACK_INDEX_KEY, JSON.stringify(entries))
}

export function getWordPackMeta(): Record<string, WordPackMeta> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(WORD_PACK_META_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getWordPackData(region: string): unknown[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`imposter_words_${region}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveWordPackData(region: string, data: unknown[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`imposter_words_${region}`, JSON.stringify(data))
  const meta = getWordPackMeta()
  meta[region] = { cachedAt: Date.now() }
  localStorage.setItem(WORD_PACK_META_KEY, JSON.stringify(meta))
}

export function clearWordPackCache(id?: string): void {
  if (typeof window === 'undefined') return
  if (id) {
    localStorage.removeItem(`imposter_words_${id}`)
    const meta = getWordPackMeta()
    delete meta[id]
    localStorage.setItem(WORD_PACK_META_KEY, JSON.stringify(meta))
  } else {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('imposter_words_')) keys.push(key)
    }
    keys.forEach((k) => localStorage.removeItem(k))
    localStorage.removeItem(WORD_PACK_META_KEY)
    localStorage.removeItem(WORD_PACK_INDEX_KEY)
  }
}

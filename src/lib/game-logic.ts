import usWords from '../data/words/us.json'
import nepalWords from '../data/words/nepal.json'
import worldWords from '../data/words/world.json'
import type { Region, Settings, Player, CurrentGame, GamePlayer, GameStats, LocalizedText } from './storage'
import {
  getRecentWords,
  addRecentWord,
  saveCurrentGame,
  saveStats,
  getStats,
} from './storage'
import { shuffleArray, generateId } from './utils'

interface WordEntry {
  word: string
  hint: string
  word_ne: string
  hint_ne: string
}

interface CategoryData {
  category: string
  category_ne?: string
  words: WordEntry[]
}

const WORD_DATA: Record<Region, CategoryData[]> = {
  us: usWords,
  nepal: nepalWords,
  world: worldWords,
}

export function getAvailableCategories(region: Region): string[] {
  return WORD_DATA[region].map((c) => c.category)
}

export function pickWordAndCategory(
  region: Region,
  allowedCategories?: string[]
): { word: string; hint: string; category: string; wordLocalized: LocalizedText; hintLocalized: LocalizedText; categoryLocalized: LocalizedText } {
  const data = WORD_DATA[region]
  const recentWords = getRecentWords()

  let pool = allowedCategories?.length
    ? data.filter((c) => allowedCategories.includes(c.category))
    : data

  if (!pool.length) pool = data

  // Shuffle categories for variety
  const shuffledCategories = shuffleArray(pool)

  for (const cat of shuffledCategories) {
    const fresh = cat.words.filter((w) => !recentWords.includes(w.word))
    const source = fresh.length > 0 ? fresh : cat.words
    const picked = source[Math.floor(Math.random() * source.length)]
    addRecentWord(picked.word)
    return {
      word: picked.word,
      hint: picked.hint,
      category: cat.category,
      wordLocalized: { en: picked.word, ne: picked.word_ne ?? picked.word },
      hintLocalized: { en: picked.hint, ne: picked.hint_ne ?? picked.hint },
      categoryLocalized: { en: cat.category, ne: cat.category_ne ?? cat.category },
    }
  }

  // Fallback
  const fallbackCat = pool[0]
  const fallback = fallbackCat.words[0]
  return {
    word: fallback.word,
    hint: fallback.hint,
    category: fallbackCat.category,
    wordLocalized: { en: fallback.word, ne: fallback.word_ne ?? fallback.word },
    hintLocalized: { en: fallback.hint, ne: fallback.hint_ne ?? fallback.hint },
    categoryLocalized: { en: fallbackCat.category, ne: fallbackCat.category_ne ?? fallbackCat.category },
  }
}

export function getImposterCount(playerCount: number, override: number | null): number {
  if (override !== null) return Math.max(1, Math.min(override, Math.floor(playerCount / 2)))
  if (playerCount <= 5) return 1
  if (playerCount <= 9) return 2
  return 3
}

export function createGame(
  players: Player[],
  settings: Settings,
  allowedCategories?: string[]
): CurrentGame {
  const { word, hint, category, wordLocalized, hintLocalized, categoryLocalized } = pickWordAndCategory(settings.region, allowedCategories)
  const imposterCount = getImposterCount(players.length, settings.imposterCountOverride)

  const shuffledPlayers = shuffleArray(players)
  const imposterIds = shuffledPlayers.slice(0, imposterCount).map((p) => p.id)

  const gamePlayers: GamePlayer[] = players.map((p) => ({
    ...p,
    isImposter: imposterIds.includes(p.id),
    hasRevealed: false,
    hasVoted: false,
  }))

  return {
    players: gamePlayers,
    secretWord: word,
    hint,
    category,
    secretWordLocalized: wordLocalized,
    hintLocalized,
    categoryLocalized,
    region: settings.region,
    imposters: imposterIds,
    phase: 'reveal',
    votes: {},
    timerStartedAt: null,
  }
}

export function markRevealed(game: CurrentGame, playerId: string): CurrentGame {
  const players = game.players.map((p) =>
    p.id === playerId ? { ...p, hasRevealed: true } : p
  )
  const allRevealed = players.every((p) => p.hasRevealed)
  return {
    ...game,
    players,
    phase: allRevealed ? 'discussion' : 'reveal',
  }
}

export function castVote(
  game: CurrentGame,
  voterId: string,
  targetId: string
): CurrentGame {
  const votes = { ...game.votes, [voterId]: targetId }
  const players = game.players.map((p) =>
    p.id === voterId ? { ...p, hasVoted: true } : p
  )
  const allVoted = players.every((p) => p.hasVoted)
  return {
    ...game,
    votes,
    players,
    phase: allVoted ? 'results' : 'voting',
  }
}

export function skipToResults(game: CurrentGame): CurrentGame {
  return { ...game, phase: 'results' }
}

export function getGameResult(game: CurrentGame): {
  imposterWins: boolean
  voteTargetId: string | null
} {
  const voteCounts: Record<string, number> = {}
  Object.values(game.votes).forEach((targetId) => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  })

  if (Object.keys(voteCounts).length === 0) {
    // No votes — imposter wins by default
    return { imposterWins: true, voteTargetId: null }
  }

  const sorted = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])
  const topVotedId = sorted[0][0]
  const imposterWins = !game.imposters.includes(topVotedId)

  return { imposterWins, voteTargetId: topVotedId }
}

export function recordGameResult(
  game: CurrentGame,
  imposterWins: boolean,
  players: Player[]
): void {
  const stats = getStats()
  stats.totalGames += 1

  for (const p of game.players) {
    if (!stats.playerStats[p.id]) {
      stats.playerStats[p.id] = {
        gamesPlayed: 0,
        timesImposter: 0,
        timesCaught: 0,
        timesSurvived: 0,
      }
    }
    const ps = stats.playerStats[p.id]
    ps.gamesPlayed += 1
    if (p.isImposter) {
      ps.timesImposter += 1
      if (!imposterWins) ps.timesCaught += 1
      else ps.timesSurvived += 1
    }
  }

  saveStats(stats)
}

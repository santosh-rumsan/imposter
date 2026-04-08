import type { WordPackEntry } from './storage'
import { getWordPackData, saveWordPackData, getWordPackIndex, saveWordPackIndex } from './storage'

const INDEX_URL = '/words/index.json'

export async function fetchIndex(): Promise<WordPackEntry[] | null> {
  try {
    const res = await fetch(INDEX_URL)
    if (!res.ok) return null
    const data: WordPackEntry[] = await res.json()
    saveWordPackIndex(data)
    return data
  } catch {
    return null
  }
}

export async function fetchAndCacheWordPack(pack: WordPackEntry): Promise<boolean> {
  try {
    const res = await fetch(pack.url)
    if (!res.ok) return false
    const data = await res.json()
    saveWordPackData(pack.id, data)
    return true
  } catch {
    return false
  }
}

/**
 * Called on app startup. Fetches a fresh index, then downloads any packs
 * marked autoDownload: true that are not yet cached locally.
 */
export async function syncWordPacks(): Promise<void> {
  const index = await fetchIndex()
  if (!index) return

  const toDownload = index.filter((p) => p.autoDownload && !getWordPackData(p.id))
  await Promise.all(toDownload.map((p) => fetchAndCacheWordPack(p)))
}

/**
 * Returns the cached index, falling back to fetching it if not available.
 */
export async function getIndex(): Promise<WordPackEntry[]> {
  return getWordPackIndex() ?? (await fetchIndex()) ?? []
}

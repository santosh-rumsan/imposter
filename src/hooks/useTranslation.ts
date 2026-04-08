import { useMemo } from 'react'
import en from '../data/translations/en.json'
import ne from '../data/translations/ne.json'
import type { Language } from '../lib/storage'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

type Translations = typeof en
type NeTranslations = DeepPartial<Translations>

const translations: Record<Language, Translations | NeTranslations> = { en, ne }

export function useTranslation(lang: Language = 'en') {
  const t = useMemo(() => {
    const dict = translations[lang] as Translations
    return function <K extends keyof Translations>(
      section: K,
      key: keyof Translations[K]
    ): string {
      const sec = dict[section] as Record<string, string> | undefined
      return sec?.[key as string] ?? (en[section] as Record<string, string>)[key as string] ?? String(key)
    }
  }, [lang])

  return { t }
}

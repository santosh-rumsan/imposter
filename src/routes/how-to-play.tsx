import { createFileRoute, Link } from '@tanstack/react-router'
import { getSettings } from '../lib/storage'
import { useTranslation } from '../hooks/useTranslation'

export const Route = createFileRoute('/how-to-play')({
  component: HowToPlayScreen,
})

const STEPS = [
  { key: 'step1', emoji: '👥' },
  { key: 'step2', emoji: '⚙️' },
  { key: 'step3', emoji: '📱' },
  { key: 'step4', emoji: '🕵️' },
  { key: 'step5', emoji: '💬' },
  { key: 'step6', emoji: '🗳️' },
  { key: 'step7', emoji: '🎉' },
] as const

export default function HowToPlayScreen() {
  const settings = getSettings()
  const { t } = useTranslation(settings.defaultLanguage)

  return (
    <div className="min-h-svh bg-[#0d0f1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-12 pb-6">
        <Link to="/" className="text-white/60 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">{t('howToPlay', 'title')}</h1>
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {STEPS.map((step, index) => {
            const titleKey = `${step.key}Title` as keyof ReturnType<typeof t> extends never ? never : any
            const descKey = `${step.key}Desc` as any
            return (
              <div
                key={step.key}
                className="flex gap-4 bg-[#151829] border border-white/6 rounded-2xl p-5 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-xl">
                  {step.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-400 text-xs font-bold">Step {index + 1}</span>
                  </div>
                  <h3 className="text-white font-bold text-base mb-1">
                    {t('howToPlay', titleKey)}
                  </h3>
                  <p className="text-[#8b8fa8] text-sm leading-relaxed">
                    {t('howToPlay', descKey)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scoring */}
        <div className="mt-6 bg-[#151829] border border-purple-500/30 rounded-2xl p-5">
          <h3 className="text-purple-400 font-bold text-base mb-3">Win Conditions</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">🕵️</span>
              <div>
                <p className="text-white font-semibold text-sm">Imposter wins if...</p>
                <p className="text-[#8b8fa8] text-xs">They are NOT voted out by the majority.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-white font-semibold text-sm">Citizens win if...</p>
                <p className="text-[#8b8fa8] text-xs">They correctly vote out the Imposter.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/players"
            className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-lg py-4 rounded-full text-center transition-all active:scale-95 block"
          >
            Play Now →
          </Link>
        </div>
      </div>
    </div>
  )
}

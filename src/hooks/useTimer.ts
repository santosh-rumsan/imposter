import { useState, useEffect, useRef } from 'react'

export function useTimer(
  durationSeconds: number,
  enabled: boolean,
  autoStart = false
) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTimeLeft(durationSeconds)
  }, [durationSeconds])

  useEffect(() => {
    if (!enabled || !running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, enabled])

  function start() {
    if (timeLeft <= 0) setTimeLeft(durationSeconds)
    setRunning(true)
  }

  function pause() {
    setRunning(false)
  }

  function reset() {
    setRunning(false)
    setTimeLeft(durationSeconds)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = durationSeconds > 0 ? timeLeft / durationSeconds : 0
  const isExpired = timeLeft <= 0

  return { timeLeft, running, start, pause, reset, formatted, progress, isExpired }
}

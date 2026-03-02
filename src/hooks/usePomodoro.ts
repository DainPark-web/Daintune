import { useState, useEffect, useRef } from 'react'

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'done'

export interface PomodoroState {
  status: PomodoroStatus
  timeLeft: number   // seconds remaining
  totalTime: number  // total seconds selected
}

export interface PomodoroActions {
  start: (minutes: number) => void
  pause: () => void
  resume: () => void
  reset: () => void
}

export const usePomodoro = (): { state: PomodoroState; actions: PomodoroActions } => {
  const [status, setStatus] = useState<PomodoroStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTime, setTotalTime] = useState(0)

  // endTimeRef: when the timer should reach 0 (null = paused/stopped)
  const endTimeRef = useRef<number | null>(null)
  // timeLeftRef: snapshot of timeLeft at pause, used in resume to avoid stale closure
  const timeLeftRef = useRef(0)

  useEffect(() => { timeLeftRef.current = timeLeft }, [timeLeft])

  useEffect(() => {
    const id = setInterval(() => {
      if (endTimeRef.current === null) return
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        endTimeRef.current = null
        setTimeLeft(0)
        setStatus('done')
      } else {
        setTimeLeft(remaining)
      }
    }, 250)
    return () => clearInterval(id)
  }, [])

  const start = (minutes: number) => {
    const seconds = minutes * 60
    endTimeRef.current = Date.now() + seconds * 1000
    setTotalTime(seconds)
    setTimeLeft(seconds)
    setStatus('running')
  }

  const pause = () => {
    endTimeRef.current = null
    setStatus('paused')
  }

  const resume = () => {
    endTimeRef.current = Date.now() + timeLeftRef.current * 1000
    setStatus('running')
  }

  const reset = () => {
    endTimeRef.current = null
    setStatus('idle')
    setTimeLeft(0)
    setTotalTime(0)
  }

  return {
    state: { status, timeLeft, totalTime },
    actions: { start, pause, resume, reset },
  }
}

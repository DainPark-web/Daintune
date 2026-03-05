import { useState, useEffect, useRef } from 'react'
import { Track } from '../types.js'
import { startPlayback, stopPlayback, pausePlayback, resumePlayback, seekPlayback } from '../player.js'

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error'

export interface PlaybackState {
  queue: Track[]
  currentIndex: number
  activeTrack: Track | null
  nextTrack: Track | null
  status: PlaybackStatus
  progress: number
  error: string | null
}

export interface PlaybackActions {
  start: (tracks: Track[], index: number) => void
  stop: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  next: () => void
  seek: (delta: number) => void
}

const getNextIndex = (current: number, length: number, shuffle: boolean): number => {
  if (!shuffle || length <= 1) return (current + 1) % length
  let next: number
  do { next = Math.floor(Math.random() * length) } while (next === current)
  return next
}

export const usePlayback = (options: {
  repeat: boolean
  shuffle: boolean
  autoplayNext: boolean
}): { state: PlaybackState; actions: PlaybackActions } => {
  const [queue, setQueue] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [status, setStatus] = useState<PlaybackStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [sessionKey, setSessionKey] = useState(0)

  const repeatRef   = useRef(options.repeat)
  const shuffleRef  = useRef(options.shuffle)
  const autoplayRef = useRef(options.autoplayNext)
  const queueRef    = useRef(queue)
  const progressRef = useRef(progress)

  useEffect(() => {
    repeatRef.current   = options.repeat
    shuffleRef.current  = options.shuffle
    autoplayRef.current = options.autoplayNext
  }, [options.repeat, options.shuffle, options.autoplayNext])

  useEffect(() => { queueRef.current = queue }, [queue])
  useEffect(() => { progressRef.current = progress }, [progress])

  const activeTrack = queue.length > 0 ? queue[currentIndex] ?? null : null
  const nextTrack   = queue.length > 1 && !options.shuffle ? queue[(currentIndex + 1) % queue.length] ?? null : null

  useEffect(() => {
    if (!activeTrack?.youtubeId) return

    setStatus('loading')
    setProgress(0)
    setError(null)

    startPlayback(activeTrack.youtubeId, {
      onPosition: (pos) => {
        setProgress(pos)
        setStatus((s) => (s === 'loading' ? 'playing' : s))
      },
      onEnd: () => {
        if (repeatRef.current) {
          setSessionKey(k => k + 1)
        } else if (queueRef.current.length > 1 && autoplayRef.current) {
          setCurrentIndex(i => getNextIndex(i, queueRef.current.length, shuffleRef.current))
        } else {
          setStatus('ended')
        }
      },
      onError: (msg) => {
        setError(msg)
        setStatus('error')
      },
    }).catch((e: Error) => {
      setError(e.message)
      setStatus('error')
    })
    // No cleanup — music keeps playing when navigating between pages.
    // startPlayback() internally calls stopPlayback() before starting a new track.
  }, [activeTrack?.youtubeId, sessionKey])

  const start = (tracks: Track[], index: number) => {
    queueRef.current = tracks
    setQueue(tracks)
    setCurrentIndex(index)
    if (tracks[index]?.youtubeId === activeTrack?.youtubeId) {
      setSessionKey(k => k + 1)
    }
  }

  const stop = () => {
    stopPlayback()
    setStatus('idle')
    setQueue([])
    setCurrentIndex(0)
    setProgress(0)
    setError(null)
  }

  const pause = () => { pausePlayback(); setStatus('paused') }

  const resume = () => { resumePlayback(); setStatus('playing') }

  const restart = () => { setSessionKey(k => k + 1) }

  const next = () => {
    if (queue.length > 1) {
      setCurrentIndex(i => getNextIndex(i, queue.length, shuffleRef.current))
    }
  }

  const seek = (delta: number) => {
    const target = Math.max(0, progressRef.current + delta)
    seekPlayback(target)
    setProgress(target)
  }

  return {
    state: { queue, currentIndex, activeTrack, nextTrack, status, progress, error },
    actions: { start, stop, pause, resume, restart, next, seek },
  }
}

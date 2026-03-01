import { Box, Text, useInput } from "ink"
import React, { useState } from "react"
import Header from "../components/Header.js"
import Footer from "../components/Footer.js"
import TextInput from "ink-text-input"
import yts from "yt-search"
import { Track } from "../types.js"

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
}

type Mode = 'input' | 'results'

const SearchPage = ({ onBack, onPlay }: Props) => {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<Mode>('input')
  const [results, setResults] = useState<Track[]>([])
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await yts(q)
      const tracks: Track[] = res.videos.slice(0, 10).map((item) => ({
        title: item.title,
        artist: item.author.name ?? 'Unknown',
        duration: item.seconds,
        youtubeId: item.videoId,
      }))
      setResults(tracks)
      setSelected(0)
      setMode('results')
    } catch (e: any) {
      setError(e.message ?? 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  // results mode key handling
  useInput(
    (_input, key) => {
      if (key.escape) {
        setMode('input')
        return
      }
      if (key.upArrow) {
        setSelected((s) => Math.max(0, s - 1))
      }
      if (key.downArrow) {
        setSelected((s) => Math.min(results.length - 1, s + 1))
      }
      if (key.return && results.length > 0) {
        onPlay(results[selected])
      }
    },
    { isActive: mode === 'results' }
  )

  // input mode Esc handling
  useInput(
    (_input, key) => {
      if (key.escape) onBack()
    },
    { isActive: mode === 'input' }
  )

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description="Search for YouTube music" />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} gap={1}>
        {mode === 'input' ? (
          <Box gap={1}>
            <Text color="green">Search:</Text>
            <TextInput
              value={query}
              onChange={setQuery}
              onSubmit={runSearch}
              placeholder="type to search YouTube Music..."
            />
          </Box>
        ) : (
          <Box gap={1}>
            <Text color="gray">Query:</Text>
            <Text>{query}</Text>
          </Box>
        )}

        {loading && <Text color="yellow">Searching...</Text>}
        {error && <Text color="red">{error}</Text>}

        {mode === 'results' && results.length === 0 && !loading && (
          <Text color="gray">No results found.</Text>
        )}

        {mode === 'results' &&
          results.map((track, i) => (
            <Box key={track.youtubeId ?? i} gap={1}>
              <Text color={i === selected ? 'green' : 'gray'}>
                {i === selected ? '>' : ' '}
              </Text>
              <Text color={i === selected ? 'white' : 'gray'} bold={i === selected}>
                {track.title.length > 40 ? track.title.slice(0, 37) + '...' : track.title}
              </Text>
              <Text color="gray">{track.artist}</Text>
              <Text color="gray">{formatDuration(track.duration)}</Text>
            </Box>
          ))}
      </Box>

      <Footer />
    </Box>
  )
}

export default SearchPage

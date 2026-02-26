import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'

const MOCK_RESULTS: Track[] = [
  { title: 'Blinding Lights',  artist: 'The Weeknd',      duration: 200 },
  { title: 'Shape of You',     artist: 'Ed Sheeran',      duration: 234 },
  { title: 'Levitating',       artist: 'Dua Lipa',        duration: 203 },
  { title: 'Stay',             artist: 'The Kid LAROI',   duration: 141 },
  { title: 'Peaches',          artist: 'Justin Bieber',   duration: 198 },
  { title: 'Bad Guy',          artist: 'Billie Eilish',   duration: 194 },
  { title: 'Watermelon Sugar', artist: 'Harry Styles',    duration: 174 },
]

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const SearchPage = ({ onBack, onPlay }: Props) => {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'input' | 'results'>('input')
  const [selected, setSelected] = useState(0)

  const results = query.trim().length > 0
    ? MOCK_RESULTS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase())
      )
    : MOCK_RESULTS

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'results') setMode('input')
      else onBack()
      return
    }

    if (mode === 'input') {
      if (key.backspace || key.delete) {
        setQuery(prev => prev.slice(0, -1))
      } else if (key.return) {
        setMode('results')
        setSelected(0)
      } else if (!key.ctrl && !key.meta && input) {
        setQuery(prev => prev + input)
      }
    } else {
      if (key.upArrow)   setSelected(prev => (prev - 1 + results.length) % results.length)
      if (key.downArrow) setSelected(prev => (prev + 1) % results.length)
      if (key.return && results.length > 0) onPlay(results[selected])
    }
  })

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={1}>
        <Text color="green" bold>gmusic</Text>
        <Text color="gray">/ Search</Text>
      </Box>

      {/* 검색창 */}
      <Box borderStyle="round" borderColor={mode === 'input' ? 'green' : 'gray'} paddingX={1}>
        <Text color="gray">Search: </Text>
        <Text>{query}</Text>
        {mode === 'input' && <Text color="green">|</Text>}
      </Box>

      {/* 결과 목록 */}
      <Box flexDirection="column" borderStyle="round" borderColor={mode === 'results' ? 'green' : 'gray'} paddingX={1}>
        <Text color="gray" dimColor>{' Title                    Artist              Time'}</Text>
        {results.length === 0
          ? <Text color="gray"> No results</Text>
          : results.map((track, i) => {
              const isSelected = mode === 'results' && i === selected
              return (
                <Box key={i}>
                  <Text
                    color={isSelected ? 'black' : 'white'}
                    backgroundColor={isSelected ? 'green' : undefined}
                  >
                    {` ${track.title.padEnd(25)} ${track.artist.padEnd(19)} ${fmt(track.duration)}`}
                  </Text>
                </Box>
              )
            })
        }
      </Box>

      <Text color="gray">
        {mode === 'input'
          ? 'Type to search  Enter confirm  Esc back'
          : 'up/down navigate  Enter play  Esc back to input'}
      </Text>
    </Box>
  )
}

export default SearchPage

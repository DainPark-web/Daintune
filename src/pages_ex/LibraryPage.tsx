import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'

const PLAYLISTS = [
  {
    name: 'Favorites',
    tracks: [
      { title: 'Blinding Lights',  artist: 'The Weeknd',    duration: 200 },
      { title: 'Levitating',       artist: 'Dua Lipa',      duration: 203 },
      { title: 'Bad Guy',          artist: 'Billie Eilish', duration: 194 },
    ],
  },
  {
    name: 'Chill Mix',
    tracks: [
      { title: 'Dreams',         artist: 'Fleetwood Mac', duration: 257 },
      { title: 'The Night We Met', artist: 'Lord Huron',  duration: 206 },
      { title: 'Skinny Love',    artist: 'Bon Iver',      duration: 213 },
    ],
  },
  {
    name: 'Workout',
    tracks: [
      { title: 'Eye of the Tiger', artist: 'Survivor',  duration: 244 },
      { title: 'Lose Yourself',    artist: 'Eminem',    duration: 326 },
      { title: 'Thunderstruck',    artist: 'AC/DC',     duration: 292 },
    ],
  },
]

interface Props {
  onBack: () => void
  onPlay: (track: Track) => void
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const LibraryPage = ({ onBack, onPlay }: Props) => {
  const [mode, setMode] = useState<'playlists' | 'tracks'>('playlists')
  const [selectedPlaylist, setSelectedPlaylist] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState(0)

  const playlist = PLAYLISTS[selectedPlaylist]

  useInput((_, key) => {
    if (key.escape) {
      if (mode === 'tracks') { setMode('playlists'); setSelectedTrack(0) }
      else onBack()
      return
    }

    if (mode === 'playlists') {
      if (key.upArrow)   setSelectedPlaylist(prev => (prev - 1 + PLAYLISTS.length) % PLAYLISTS.length)
      if (key.downArrow) setSelectedPlaylist(prev => (prev + 1) % PLAYLISTS.length)
      if (key.return)    { setMode('tracks'); setSelectedTrack(0) }
    } else {
      if (key.upArrow)   setSelectedTrack(prev => (prev - 1 + playlist.tracks.length) % playlist.tracks.length)
      if (key.downArrow) setSelectedTrack(prev => (prev + 1) % playlist.tracks.length)
      if (key.return)    onPlay(playlist.tracks[selectedTrack])
    }
  })

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Box gap={1}>
        <Text color="green" bold>gmusic</Text>
        <Text color="gray">
          {mode === 'tracks' ? `/ Library / ${playlist.name}` : '/ Library'}
        </Text>
      </Box>

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1}>
        {mode === 'playlists'
          ? PLAYLISTS.map((pl, i) => {
              const isSelected = i === selectedPlaylist
              return (
                <Box key={pl.name}>
                  <Text
                    color={isSelected ? 'black' : 'white'}
                    backgroundColor={isSelected ? 'green' : undefined}
                  >
                    {` [+] ${pl.name.padEnd(20)} ${pl.tracks.length} tracks`}
                  </Text>
                </Box>
              )
            })
          : playlist.tracks.map((track, i) => {
              const isSelected = i === selectedTrack
              return (
                <Box key={i}>
                  <Text
                    color={isSelected ? 'black' : 'white'}
                    backgroundColor={isSelected ? 'green' : undefined}
                  >
                    {` [>] ${track.title.padEnd(24)} ${track.artist.padEnd(18)} ${fmt(track.duration)}`}
                  </Text>
                </Box>
              )
            })
        }
      </Box>

      <Text color="gray">up/down navigate  Enter select  Esc back</Text>
    </Box>
  )
}

export default LibraryPage

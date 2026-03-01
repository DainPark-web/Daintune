import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import { Track } from '../types.js'
import Header from '../components/Header.js'
import TextInput from 'ink-text-input'
import Footer from '../components/Footer.js'
import MiniPlayer from '../components/MiniPlayer.js'
import { PlaybackStatus } from '../hooks/usePlayback.js'

export interface Playlist {
  name: string
  tracks: Track[]
}

export const INITIAL_PLAYLISTS: Playlist[] = [
  { name: 'Favorites', tracks: [
    
  ] },
]

interface Props {
  playlists: Playlist[]
  onAddPlaylist: (name: string) => void
  onRemovePlaylist: (index: number) => void
  onRemoveTrack: (playlistIndex: number, trackIndex: number) => void
  onPlayPlaylist: (tracks: Track[], trackIndex: number, playlistIndex: number) => void
  initialPlaylistIndex: number
  initialMode: 'playlists' | 'tracks'
  onBack: () => void
  miniPlayer: { activeTrack: Track | null; status: PlaybackStatus }
}

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

const LibraryPage = ({ playlists, onAddPlaylist, onRemovePlaylist, onRemoveTrack, onPlayPlaylist, initialPlaylistIndex, initialMode, onBack, miniPlayer }: Props) => {
  const [mode, setMode] = useState<'playlists' | 'tracks' | 'createPlaylist'>(initialMode)
  const [selectedPlaylist, setSelectedPlaylist] = useState(initialPlaylistIndex)
  const [selectedTrack, setSelectedTrack] = useState(0)
  const [playlistName, setPlaylistName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<false | 'track' | 'playlist'>(false)

  const playlist = playlists[selectedPlaylist]

  useInput((input, key) => {
    if (mode === 'createPlaylist') {
      if (key.return) {
        if (playlistName.trim()) onAddPlaylist(playlistName.trim())
        setMode('playlists')
        setPlaylistName('')
      }
      if (key.escape) {
        setMode('playlists')
        setPlaylistName('')
      }
      return
    }

    if (confirmDelete) {
      if (input === 'y') {
        if (confirmDelete === 'track') {
          onRemoveTrack(selectedPlaylist, selectedTrack)
          setSelectedTrack(Math.min(selectedTrack, Math.max(0, playlist.tracks.length - 2)))
        } else {
          onRemovePlaylist(selectedPlaylist)
          setSelectedPlaylist(Math.min(selectedPlaylist, Math.max(0, playlists.length - 2)))
        }
        setConfirmDelete(false)
      }
      if (input === 'n' || key.escape) setConfirmDelete(false)
      return
    }

    if (mode === 'playlists') {
      if (key.upArrow)   setSelectedPlaylist(prev => (prev - 1 + playlists.length) % playlists.length)
      if (key.downArrow) setSelectedPlaylist(prev => (prev + 1) % playlists.length)
      if (key.return)    { setMode('tracks'); setSelectedTrack(0) }
      if (key.escape)    onBack()
      if (input === 'c') setMode('createPlaylist')
      if (input === 'r') setConfirmDelete('playlist')
    }

    if (mode === 'tracks') {
      const count = playlist.tracks.length
      if (count > 0) {
        if (key.upArrow)   setSelectedTrack(prev => (prev - 1 + count) % count)
        if (key.downArrow) setSelectedTrack(prev => (prev + 1) % count)
        if (key.return)    onPlayPlaylist(playlist.tracks, selectedTrack, selectedPlaylist)
        if (input === 'r') setConfirmDelete('track')
      }
      if (key.escape) { setMode('playlists'); setSelectedTrack(0) }
    }
  })

  const footerText = mode === 'tracks'
    ? `up/down navigate  Enter play  r remove  Esc back`
    : `up/down navigate  Enter select  r remove  c create  Esc back`

  return (
    <Box flexDirection="column" padding={1} gap={1}>
      <Header description={
        mode === 'tracks' ? `Library / ${playlist.name}` :
        mode === 'createPlaylist' ? 'Create Playlist' : 'Library'
      } />

      <Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1} paddingY={1} gap={1}>
        {mode === 'playlists' && playlists.map((pl, i) => (
          <Box key={pl.name}>
            <Text
              color={i === selectedPlaylist ? 'black' : 'white'}
              backgroundColor={i === selectedPlaylist ? 'green' : undefined}
            >
              {` [+] ${pl.name.padEnd(20)} ${pl.tracks.length} tracks`}
            </Text>
          </Box>
        ))}

        {mode === 'tracks' && (
          playlist.tracks.length === 0
            ? <Text color="gray">  No tracks yet. Search for songs and add them here.</Text>
            : playlist.tracks.map((track, i) => (
                <Box key={i}>
                  <Text
                    color={i === selectedTrack ? 'black' : 'white'}
                    backgroundColor={i === selectedTrack ? 'green' : undefined}
                  >
                    {` [>] ${track.title.padEnd(24)} ${track.artist.padEnd(18)} ${fmt(track.duration)}`}
                  </Text>
                </Box>
              ))
        )}

        {mode === 'createPlaylist' && (
          <Box gap={1}>
            <Text color="green">Name:</Text>
            <TextInput value={playlistName} onChange={setPlaylistName} />
          </Box>
        )}

        {confirmDelete && (
          <Box gap={2} marginTop={1}>
            <Text color="red">
              Remove "{confirmDelete === 'track' ? playlist.tracks[selectedTrack]?.title : playlists[selectedPlaylist]?.name}"?
            </Text>
            <Text color="yellow">[y] Yes  [n] No</Text>
          </Box>
        )}
      </Box>

      <MiniPlayer activeTrack={miniPlayer.activeTrack} status={miniPlayer.status} />
      <Footer description={footerText} />
    </Box>
  )
}

export default LibraryPage

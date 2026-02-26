import React, { useState } from 'react'
import { render } from 'ink'
import MenuPage from './pages_ex/MenuPage.js'
import { Page, Track } from './types.js'

const App = () => {
  const [page, setPage] = useState<Page>('menu')

  



  return <MenuPage onNavigate={setPage} />
}
// const App = () => {
//   const [page, setPage] = useState<Page>('menu')
//   const [currentTrack, setCurrentTrack] = useState<Track | null>(null)

//   const handlePlay = (track: Track) => {
//     setCurrentTrack(track)
//     setPage('nowPlaying')
//   }

//   if (page === 'search')     return <SearchPage     onBack={() => setPage('menu')} onPlay={handlePlay} />
//   if (page === 'library')    return <LibraryPage    onBack={() => setPage('menu')} onPlay={handlePlay} />
//   if (page === 'nowPlaying') return <NowPlayingPage track={currentTrack}           onBack={() => setPage('menu')} />
//   if (page === 'settings')   return <SettingsPage   onBack={() => setPage('menu')} />

//   return <MenuPage onNavigate={setPage} />
// }

render(<App />)

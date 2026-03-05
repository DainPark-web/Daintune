import fs from 'fs'
import path from 'path'
import os from 'os'
import { Playlist } from './pages/LibraryPage.js'
import { Setting } from './pages/SettingsPage.js'
import { HistoryEntry } from './types.js'

const DATA_DIR       = path.join(os.homedir(), '.daintune')
const PLAYLISTS_FILE = path.join(DATA_DIR, 'playlists.json')
const SETTINGS_FILE  = path.join(DATA_DIR, 'settings.json')
const HISTORY_FILE   = path.join(DATA_DIR, 'history.json')

const read = <T>(file: string): T | null => {
  try {
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch {
    return null
  }
}

const write = (file: string, data: unknown): void => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
  } catch {}
}

export const loadPlaylists = (): Playlist[] | null => read<Playlist[]>(PLAYLISTS_FILE)
export const savePlaylists = (playlists: Playlist[]): void => write(PLAYLISTS_FILE, playlists)

export const loadSettings = (): Setting[] | null => read<Setting[]>(SETTINGS_FILE)
export const saveSettings = (settings: Setting[]): void => write(SETTINGS_FILE, settings)

export const loadHistory = (): HistoryEntry[] | null => read<HistoryEntry[]>(HISTORY_FILE)
export const saveHistory = (entries: HistoryEntry[]): void => write(HISTORY_FILE, entries)

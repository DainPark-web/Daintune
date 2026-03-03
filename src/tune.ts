import { spawn, ChildProcess } from 'child_process'
import { join, dirname } from 'path' 
import { fileURLToPath } from 'url'  


const __dirname = dirname(fileURLToPath(import.meta.url)) 
const SOUND_FILE = join(__dirname, '..', 'assets', 'alarm.wav') 

let tuneProcess: ChildProcess | null = null

export const playTune = () => {
  stopTune()
  tuneProcess = spawn('mpv', [
    '--no-video',
    '--loop=inf',
    '--quiet',
    '--no-terminal',
    SOUND_FILE,
  ], { stdio: 'ignore' })
}

export const stopTune = () => {
  if (tuneProcess) {
    tuneProcess.kill()
    tuneProcess = null
  }
}

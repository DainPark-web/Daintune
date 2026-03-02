import { spawn, ChildProcess } from 'child_process'

const SOUND_FILE = '/System/Library/Sounds/Glass.aiff'

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

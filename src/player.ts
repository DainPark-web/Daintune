import { spawn, ChildProcess } from 'child_process'
import * as net from 'net'
import * as fs from 'fs'

const SOCKET_PATH = '/tmp/daintune-mpv.sock'

let mpvProcess: ChildProcess | null = null
let ipcSocket: net.Socket | null = null
let currentToken = { active: false }

export interface PlayerCallbacks {
  onPosition?: (pos: number) => void
  onEnd?: () => void
  onError?: (msg: string) => void
}

export const startPlayback = (youtubeId: string, callbacks: PlayerCallbacks = {}): Promise<void> => {
  stopPlayback()
  const token = { active: true }
  currentToken = token

  return new Promise((resolve, reject) => {
    if (fs.existsSync(SOCKET_PATH)) {
      try { fs.unlinkSync(SOCKET_PATH) } catch {}
    }

    mpvProcess = spawn('mpv', [
      '--no-video',
      '--no-terminal',
      '--really-quiet',
      `--input-ipc-server=${SOCKET_PATH}`,
      `https://youtube.com/watch?v=${youtubeId}`,
    ], { stdio: 'ignore' })

    mpvProcess.on('error', (e) => {
      if (!token.active) return
      callbacks.onError?.(e.message)
      reject(e)
    })

    mpvProcess.on('exit', () => {
      if (!token.active) return
      callbacks.onEnd?.()
    })

    // Poll for socket file creation, then connect
    const waitForSocket = (attempts = 0) => {
      if (!token.active) return
      if (fs.existsSync(SOCKET_PATH)) {
        connectIpc(resolve, callbacks)
      } else if (attempts < 50) {
        setTimeout(() => waitForSocket(attempts + 1), 200)
      } else {
        reject(new Error('mpv IPC socket not created (timeout)'))
      }
    }

    setTimeout(() => waitForSocket(), 300)
  })
}

const connectIpc = (onReady: () => void, callbacks: PlayerCallbacks) => {
  ipcSocket = net.createConnection(SOCKET_PATH)

  ipcSocket.on('connect', () => {
    ipcSocket!.write(JSON.stringify({ command: ['observe_property', 1, 'time-pos'] }) + '\n')
    onReady()
  })

  ipcSocket.on('error', () => {})

  let buffer = ''
  ipcSocket.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const msg = JSON.parse(line)
        if (msg.event === 'property-change' && msg.name === 'time-pos' && typeof msg.data === 'number') {
          callbacks.onPosition?.(Math.round(msg.data))
        }
        if (msg.event === 'end-file') {
          callbacks.onEnd?.()
        }
      } catch {}
    }
  })
}

export const stopPlayback = () => {
  currentToken.active = false
  ipcSocket?.destroy()
  ipcSocket = null
  if (mpvProcess) {
    mpvProcess.kill('SIGTERM')
    mpvProcess = null
  }
}

const sendCmd = (cmd: unknown[]) => {
  if (!ipcSocket || ipcSocket.destroyed) return
  try {
    ipcSocket.write(JSON.stringify({ command: cmd }) + '\n')
  } catch {}
}

export const pausePlayback = () => sendCmd(['set_property', 'pause', true])
export const resumePlayback = () => sendCmd(['set_property', 'pause', false])
export const seekPlayback = (seconds: number) => sendCmd(['seek', seconds, 'absolute'])

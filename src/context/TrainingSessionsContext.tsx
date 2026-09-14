import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type TrainingSession = {
  code: string
  title: string
  date: string
}

type TrainingSessionsContextValue = {
  sessions: TrainingSession[]
  addSession: (title: string, date: string) => TrainingSession
  findSession: (code: string) => TrainingSession | undefined
}

const STORAGE_KEY = 'dtr-training-sessions'

const TrainingSessionsContext = createContext<TrainingSessionsContextValue | null>(null)

function loadSessions(): TrainingSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TrainingSession[]) : []
  } catch {
    return []
  }
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function TrainingSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadSessions())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch {
      // localStorage not available (private mode, etc.) — sessions stay in-memory only.
    }
  }, [sessions])

  function addSession(title: string, date: string) {
    const session: TrainingSession = { code: generateCode(), title, date }
    setSessions((prev) => [session, ...prev])
    return session
  }

  function findSession(code: string) {
    return sessions.find((s) => s.code === code)
  }

  return (
    <TrainingSessionsContext.Provider value={{ sessions, addSession, findSession }}>
      {children}
    </TrainingSessionsContext.Provider>
  )
}

export function useTrainingSessions() {
  const ctx = useContext(TrainingSessionsContext)
  if (!ctx) throw new Error('useTrainingSessions must be used within TrainingSessionsProvider')
  return ctx
}

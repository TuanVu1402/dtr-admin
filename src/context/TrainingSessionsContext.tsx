import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { readShared, subscribeShared, writeShared } from '../utils/sharedStore'

export type TrainingAttendee = {
  userName: string
  room?: string
  checkedInAt: string
}

export type TrainingSession = {
  code: string
  title: string
  date: string
  status: 'open' | 'closed'
  attendees: TrainingAttendee[]
}

export type CheckinResult = 'ok' | 'duplicate' | 'closed' | 'not_found'

type TrainingSessionsContextValue = {
  sessions: TrainingSession[]
  addSession: (title: string, date: string) => TrainingSession
  findSession: (code: string) => TrainingSession | undefined
  recordCheckin: (code: string, userName: string, room?: string) => CheckinResult
  closeSession: (code: string) => void
  reopenSession: (code: string) => void
  deleteSession: (code: string) => void
}

const STORAGE_KEY = 'dtr-training-sessions'

const TrainingSessionsContext = createContext<TrainingSessionsContextValue | null>(null)

function normalizeSessions(raw: unknown): TrainingSession[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const s = item as Partial<TrainingSession>
    return {
      code: String(s.code ?? ''),
      title: String(s.title ?? ''),
      date: String(s.date ?? ''),
      status: s.status === 'closed' ? 'closed' : 'open',
      attendees: Array.isArray(s.attendees) ? s.attendees : [],
    }
  })
}

function loadSessions(): TrainingSession[] {
  return normalizeSessions(readShared(STORAGE_KEY, []))
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

function nowLabel() {
  return new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function TrainingSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadSessions())

  useEffect(() => {
    writeShared(STORAGE_KEY, sessions)
  }, [sessions])

  useEffect(() => {
    return subscribeShared(STORAGE_KEY, () => {
      const next = loadSessions()
      setSessions((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    })
  }, [])

  function addSession(title: string, date: string) {
    const session: TrainingSession = {
      code: generateCode(),
      title,
      date,
      status: 'open',
      attendees: [],
    }
    setSessions((prev) => [session, ...prev])
    return session
  }

  function findSession(code: string) {
    return sessions.find((s) => s.code === code)
  }

  function recordCheckin(code: string, userName: string, room?: string): CheckinResult {
    const session = sessions.find((s) => s.code === code)
    if (!session) return 'not_found'
    if (session.status === 'closed') return 'closed'
    if (session.attendees.some((a) => a.userName === userName)) return 'duplicate'

    setSessions((prev) =>
      prev.map((s) =>
        s.code !== code
          ? s
          : {
              ...s,
              attendees: [{ userName, room, checkedInAt: nowLabel() }, ...s.attendees],
            },
      ),
    )
    return 'ok'
  }

  function closeSession(code: string) {
    setSessions((prev) => prev.map((s) => (s.code === code ? { ...s, status: 'closed' } : s)))
  }

  function reopenSession(code: string) {
    setSessions((prev) => prev.map((s) => (s.code === code ? { ...s, status: 'open' } : s)))
  }

  function deleteSession(code: string) {
    setSessions((prev) => prev.filter((s) => s.code !== code))
  }

  return (
    <TrainingSessionsContext.Provider
      value={{ sessions, addSession, findSession, recordCheckin, closeSession, reopenSession, deleteSession }}
    >
      {children}
    </TrainingSessionsContext.Provider>
  )
}

export function useTrainingSessions() {
  const ctx = useContext(TrainingSessionsContext)
  if (!ctx) throw new Error('useTrainingSessions must be used within TrainingSessionsProvider')
  return ctx
}

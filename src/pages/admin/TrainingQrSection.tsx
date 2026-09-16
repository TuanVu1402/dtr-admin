import { useMemo, useState, type FormEvent } from 'react'
import QrCodeImage from '../../components/ui/QrCodeImage'
import SearchableSelect from '../../components/form/SearchableSelect'
import { DownloadIcon, ExpandIcon, QrIcon, SearchIcon, TrashIcon } from '../../components/ui/icons'
import ConfirmDialog from '../../components/modal/ConfirmDialog'
import { useTrainingSessions, type TrainingAttendee, type TrainingSession } from '../../context/TrainingSessionsContext'
import { useSubmissions } from '../../context/SubmissionsContext'
import { useAuth } from '../../context/AuthContext'
import { useAudit } from '../../context/AuditContext'
import { useNotifications } from '../../context/NotificationsContext'
import { exportCsv } from '../../utils/exportCsv'
import UserAvatar from '../../components/ui/UserAvatar'

function buildCheckinUrl(code: string) {
  const userOrigin = (import.meta.env.VITE_USER_APP_URL as string | undefined) || 'http://localhost:5173'
  return `${userOrigin.replace(/\/$/, '')}/?checkin=${encodeURIComponent(code)}`
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

function mergeAttendees(session: TrainingSession, submissions: { userName: string; categoryLabel: string; description: string; status: string; date: string }[], users: { name: string; room?: string }[]): TrainingAttendee[] {
  const byName = new Map<string, TrainingAttendee>()
  for (const a of session.attendees) byName.set(a.userName, a)
  for (const s of submissions) {
    if (s.status !== 'approved') continue
    if (s.categoryLabel !== 'Training / Kick off') continue
    const hit = s.description.includes(session.code) || s.description.includes(session.title)
    if (!hit) continue
    if (byName.has(s.userName)) continue
    byName.set(s.userName, {
      userName: s.userName,
      room: users.find((u) => u.name === s.userName)?.room,
      checkedInAt: s.date,
    })
  }
  return Array.from(byName.values())
}

/** Khối tạo / chiếu mã QR điểm danh Training — thuộc Admin, không phải Manager. */
export default function TrainingQrSection() {
  const { sessions, addSession, closeSession, reopenSession, deleteSession, recordCheckin } = useTrainingSessions()
  const { submissions, users, addUser, addSubmission } = useSubmissions()
  const { role, profile } = useAuth()
  const { logAudit } = useAudit()
  const { pushNotification } = useNotifications()
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({})
  const [viewingCode, setViewingCode] = useState<string | null>(null)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [existingUser, setExistingUser] = useState('')
  const [addHint, setAddHint] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const viewingSession = sessions.find((s) => s.code === viewingCode) ?? null
  const deletingSession = sessions.find((s) => s.code === deletingCode) ?? null
  const userCount = users.filter((u) => u.role === 'user').length

  const filteredSessions = useMemo(() => {
    const keyword = sessionSearch.trim().toLowerCase()
    if (!keyword) return sessions
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(keyword) || s.code.toLowerCase().includes(keyword),
    )
  }, [sessions, sessionSearch])

  const saleUsers = users.filter((u) => u.role === 'user')
  const viewingAttendees = viewingSession ? mergeAttendees(viewingSession, submissions, users) : []
  const viewingAbsentees = saleUsers.filter((u) => !viewingAttendees.some((a) => a.userName === u.name))

  function handleCreateSession(e: FormEvent) {
    e.preventDefault()
    if (!sessionTitle.trim()) return
    addSession(sessionTitle.trim(), sessionDate)
    if (role) {
      logAudit({ actor: profile.name, actorRole: role, action: 'create_qr', target: sessionTitle.trim() })
      pushNotification({ kind: 'info', title: 'Đã tạo mã QR', description: sessionTitle.trim() })
    }
    setSessionTitle('')
    setSessionDate('')
  }

  function handleDownloadQr(session: TrainingSession) {
    const dataUrl = qrDataUrls[session.code]
    if (!dataUrl) return
    downloadDataUrl(dataUrl, `qr-${session.title.replace(/\s+/g, '-').toLowerCase()}-${session.code}.png`)
  }

  function handleExportAttendees(session: TrainingSession, attendees: TrainingAttendee[]) {
    exportCsv(
      `diem-danh-${session.code}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Họ tên', 'Phòng', 'Giờ điểm danh', 'Điểm'],
      attendees.map((a) => [a.userName, a.room ?? '—', a.checkedInAt, 1]),
    )
  }

  function attendeesOf(session: TrainingSession) {
    return mergeAttendees(session, submissions, users)
  }

  function checkInUser(session: TrainingSession, userName: string, room?: string) {
    const result = recordCheckin(session.code, userName, room)
    if (result !== 'ok') return result
    addSubmission({
      userName,
      categoryLabel: 'Training / Kick off',
      description: `Điểm danh QR — ${session.title} (${session.code})`,
      date: new Date().toLocaleDateString('vi-VN'),
      points: 1,
      status: 'approved',
    })
    if (role) {
      logAudit({ actor: profile.name, actorRole: role, action: 'add_attendee', target: userName, detail: session.title })
      pushNotification({ kind: 'success', title: 'Đã thêm người vào sổ', description: `${userName} — ${session.title}` })
    }
    return result
  }

  function slugEmail(name: string) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '')
    return `${slug || 'sale'}.${Date.now().toString(36)}@dtr.vn`
  }

  function handleAddPerson() {
    if (!viewingSession) return
    const name = newName.trim()
    const room = newRoom.trim() || undefined
    if (!name) {
      setAddHint('Nhập họ tên người cần thêm.')
      return
    }
    if (viewingAttendees.some((a) => a.userName.toLowerCase() === name.toLowerCase())) {
      setAddHint('Người này đã có trong sổ điểm danh.')
      return
    }
    let user = users.find((u) => u.name.toLowerCase() === name.toLowerCase())
    if (!user) {
      user = addUser(name, slugEmail(name), 'user', room)
    }
    const result = checkInUser(viewingSession, user.name, room ?? user.room)
    if (result !== 'ok') {
      setAddHint(result === 'closed' ? 'Buổi đã đóng, không thêm được.' : 'Không thêm được người này.')
      return
    }
    setNewName('')
    setNewRoom('')
    setExistingUser('')
    setAddHint(`Đã thêm ${user.name} và cộng +1 điểm.`)
  }

  function handleAddExisting() {
    if (!viewingSession || !existingUser) return
    const user = users.find((u) => u.name === existingUser)
    const result = checkInUser(viewingSession, existingUser, user?.room)
    if (result !== 'ok') {
      setAddHint(result === 'duplicate' ? 'Người này đã có trong sổ điểm danh.' : 'Không thêm được người này.')
      return
    }
    setExistingUser('')
    setAddHint(`Đã thêm ${existingUser} và cộng +1 điểm.`)
  }

  async function handleCopyLink(code: string) {
    try {
      await navigator.clipboard.writeText(buildCheckinUrl(code))
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      setCopiedLink(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-1) p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(37,99,235,0.25)] bg-[rgba(37,99,235,0.1)] text-(--gold)">
            <QrIcon size={22} />
          </div>
          <div>
            <div className="font-['Open_Sans',sans-serif] text-lg font-extrabold tracking-[0.3px] text-(--text-primary)">
              Tạo mã QR điểm danh Training / Kick off
            </div>
            <p className="m-0 mt-1 text-sm font-medium text-(--text-tertiary)">
              Tạo buổi rồi chiếu mã lên màn hình. Sale quét sẽ được +1 điểm và hiện trong sổ điểm danh của buổi.
              Đóng mã khi hết giờ; xóa mã nếu tạo nhầm.
            </p>
          </div>
        </div>

        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-4"
          onSubmit={handleCreateSession}
        >
          <div className="flex min-w-[220px] flex-1 flex-col gap-2">
            <label className="text-[12.5px] font-bold text-(--text-secondary)">Tên buổi</label>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
              type="text"
              placeholder="Tên buổi Training / Kick off"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex min-w-[170px] flex-col gap-2">
            <label className="text-[12.5px] font-bold text-(--text-secondary)">Ngày diễn ra</label>
            <input
              className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-6 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
          >
            <QrIcon size={16} /> Tạo mã QR
          </button>
        </form>

        {sessions.length === 0 ? (
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có buổi Training nào được tạo.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12.5px] font-bold text-(--text-secondary)">
                Đã tạo {sessions.length} buổi — bấm vào một buổi để chiếu QR và xem ai đã điểm danh.
              </div>
              {sessions.length > 5 && (
                <div className="relative flex min-w-[200px] items-center">
                  <span className="pointer-events-none absolute left-3">
                    <SearchIcon size={14} />
                  </span>
                  <input
                    className="w-full rounded-full border border-[rgba(37,99,235,0.25)] bg-(--surface-1) py-2 pr-3.5 pl-8 text-[13px] text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
                    type="text"
                    placeholder="Tìm theo tên hoặc mã..."
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-2">
              {filteredSessions.length === 0 && (
                <p className="m-0 px-3 py-4 text-center text-[13px] text-(--text-tertiary)">
                  Không tìm thấy buổi phù hợp.
                </p>
              )}
              {filteredSessions.map((session) => {
                const count = attendeesOf(session).length
                const closed = session.status === 'closed'
                return (
                  <div
                    className="flex items-center gap-2 rounded-lg border border-transparent bg-(--surface-1) pr-2 transition-[border-color,box-shadow] duration-150 hover:border-[rgba(37,99,235,0.3)] hover:shadow-[0_4px_12px_var(--shadow)]"
                    key={session.code}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 border-none bg-transparent px-3.5 py-2.5 text-left font-inherit"
                      onClick={() => {
                        setViewingCode(session.code)
                        setNewName('')
                        setNewRoom('')
                        setExistingUser('')
                        setAddHint(null)
                        setCopiedLink(false)
                      }}
                    >
                      <div className="shrink-0 overflow-hidden rounded-md border border-[rgba(37,99,235,0.16)]">
                        <QrCodeImage
                          value={buildCheckinUrl(session.code)}
                          size={44}
                          onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [session.code]: url }))}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-['Open_Sans',sans-serif] text-sm font-bold text-(--text-primary)">
                            {session.title}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10.5px] font-extrabold ${
                              closed
                                ? 'border-[rgba(169,47,33,0.35)] bg-[rgba(169,47,33,0.1)] text-(--negative)'
                                : 'border-[rgba(20,108,62,0.35)] bg-[rgba(20,108,62,0.1)] text-(--positive)'
                            }`}
                          >
                            {closed ? 'Đã đóng' : 'Đang mở'}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-(--text-tertiary)">
                          {session.date && <span>{session.date}</span>}
                          <span className="tracking-[1px] text-(--gold-bright)">Mã: {session.code}</span>
                          <span>
                            {count}/{userCount || '—'} đã điểm danh
                          </span>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(37,99,235,0.28)] px-3 py-1.5 text-xs font-bold text-(--gold-bright)">
                        <ExpandIcon size={13} /> Chi tiết
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[rgba(217,122,108,0.3)] bg-transparent text-(--negative) hover:bg-[rgba(217,122,108,0.1)]"
                      aria-label={`Xóa buổi ${session.title}`}
                      onClick={() => setDeletingCode(session.code)}
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {viewingSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
          onClick={() => setViewingCode(null)}
        >
          <div
            className="flex max-h-[90svh] w-full max-w-[820px] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">
                  Chiếu mã QR &amp; sổ điểm danh
                </div>
                <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
                  {viewingSession.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-(--text-tertiary)">
                  {viewingSession.date && <span>{viewingSession.date}</span>}
                  <span className="tracking-[1px] text-(--gold-bright)">Mã: {viewingSession.code}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10.5px] font-extrabold ${
                      viewingSession.status === 'closed'
                        ? 'border-[rgba(169,47,33,0.35)] bg-[rgba(169,47,33,0.1)] text-(--negative)'
                        : 'border-[rgba(20,108,62,0.35)] bg-[rgba(20,108,62,0.1)] text-(--positive)'
                    }`}
                  >
                    {viewingSession.status === 'closed' ? 'Đã đóng điểm danh' : 'Đang nhận điểm danh'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
                onClick={() => setViewingCode(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-[220px_1fr] items-start gap-6 max-[720px]:grid-cols-1">
              <div className="flex flex-col items-center gap-3">
                <div className={`rounded-2xl border border-[rgba(37,99,235,0.2)] bg-white p-3 ${viewingSession.status === 'closed' ? 'opacity-45' : ''}`}>
                  <QrCodeImage
                    value={buildCheckinUrl(viewingSession.code)}
                    size={194}
                    onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [viewingSession.code]: url }))}
                  />
                </div>
                {viewingSession.status === 'closed' && (
                  <p className="m-0 text-center text-[12px] font-bold text-(--negative)">
                    Mã đã đóng — quét thêm sẽ không cộng điểm.
                  </p>
                )}
                <button
                  type="button"
                  className="cursor-pointer border-none bg-transparent text-[12px] font-bold text-(--gold-bright) underline-offset-2 hover:underline"
                  onClick={() => handleCopyLink(viewingSession.code)}
                >
                  {copiedLink ? 'Đã sao chép link' : 'Sao chép link quét'}
                </button>
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="rounded-full bg-(--gold) px-3 py-1.5 text-[12px] font-bold text-white">
                    Đã điểm danh {viewingAttendees.length}
                  </div>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[rgba(37,99,235,0.3)] bg-transparent px-3 py-1.5 font-inherit text-[12px] font-bold text-(--text-secondary) disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={viewingAttendees.length === 0}
                    onClick={() => handleExportAttendees(viewingSession, viewingAttendees)}
                  >
                    <DownloadIcon size={13} /> Xuất Excel
                  </button>
                </div>

                {viewingSession.status === 'open' && (
                  <div className="flex flex-col gap-3 rounded-xl border border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.04)] p-3">
                    <div className="text-[12px] font-bold text-(--text-secondary)">Thêm người không quét được QR</div>
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="min-w-[160px] flex-1">
                        <input
                          className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-2.5 font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
                          type="text"
                          placeholder="Họ tên"
                          value={newName}
                          onChange={(e) => {
                            setNewName(e.target.value)
                            setAddHint(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddPerson()
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-[120px] w-[34%]">
                        <input
                          className="w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-1) px-3.5 py-2.5 font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
                          type="text"
                          placeholder="Phòng (không bắt buộc)"
                          value={newRoom}
                          onChange={(e) => setNewRoom(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddPerson()
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="min-h-[42px] cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-4 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!newName.trim()}
                        onClick={handleAddPerson}
                      >
                        Thêm người
                      </button>
                    </div>
                    {viewingAbsentees.length > 0 && (
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-[180px] flex-1">
                          <SearchableSelect
                            options={viewingAbsentees.map((u) => ({
                              value: u.name,
                              label: u.room ? `${u.name} — ${u.room}` : u.name,
                            }))}
                            value={existingUser}
                            onChange={(value) => {
                              setExistingUser(value)
                              setAddHint(null)
                            }}
                            placeholder="Chọn người đã có trong danh sách..."
                          />
                        </div>
                        <button
                          type="button"
                          className="min-h-[42px] cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-4 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold text-(--gold-bright) disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={!existingUser}
                          onClick={handleAddExisting}
                        >
                          Thêm
                        </button>
                      </div>
                    )}
                    {addHint && <p className="m-0 text-[12px] text-(--text-tertiary)">{addHint}</p>}
                  </div>
                )}

                {viewingAttendees.length === 0 ? (
                  <p className="m-0 rounded-xl border border-dashed border-[rgba(37,99,235,0.25)] px-4 py-6 text-center text-[13px] text-(--text-tertiary)">
                    Chưa có ai điểm danh buổi này. Sale quét mã, hoặc thêm người không quét được QR ở trên.
                  </p>
                ) : (
                  <div className="flex max-h-[240px] flex-col overflow-y-auto rounded-xl border border-[rgba(37,99,235,0.16)]">
                    {viewingAttendees.map((a) => (
                      <div
                        className="flex items-center gap-3 border-b border-(--hairline) px-3.5 py-2.5 last:border-b-0"
                        key={`${a.userName}-${a.checkedInAt}`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] text-[11px] font-bold text-white">
                          <UserAvatar name={a.userName} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13.5px] font-bold text-(--text-primary)">{a.userName}</div>
                          <div className="text-[11.5px] text-(--text-tertiary)">{a.room ?? 'Chưa gán phòng'}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-[12px] font-bold text-(--gold-bright)">+1 điểm</div>
                          <div className="text-[11px] text-(--text-muted)">{a.checkedInAt}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {viewingSession.status === 'open' ? (
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
                  onClick={() => {
                    closeSession(viewingSession.code)
                    if (role) logAudit({ actor: profile.name, actorRole: role, action: 'close_qr', target: viewingSession.title })
                  }}
                >
                  Đóng điểm danh
                </button>
              ) : (
                <button
                  type="button"
                  className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
                  onClick={() => {
                    reopenSession(viewingSession.code)
                    if (role) logAudit({ actor: profile.name, actorRole: role, action: 'reopen_qr', target: viewingSession.title })
                  }}
                >
                  Mở lại điểm danh
                </button>
              )}
              <button
                type="button"
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
                onClick={() => handleDownloadQr(viewingSession)}
              >
                <DownloadIcon size={15} /> Tải ảnh QR
              </button>
              <button
                type="button"
                className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[rgba(217,122,108,0.4)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--negative)"
                onClick={() => setDeletingCode(viewingSession.code)}
              >
                <TrashIcon size={14} /> Xóa mã QR
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingSession && (
        <ConfirmDialog
          title="Xóa mã QR"
          message={`Xóa buổi "${deletingSession.title}"? Sale sẽ không quét được mã này nữa. Sổ điểm danh của buổi cũng mất. Điểm đã cộng cho người đã quét thì vẫn giữ.`}
          confirmLabel="Xóa"
          danger
          onCancel={() => setDeletingCode(null)}
          onConfirm={() => {
            deleteSession(deletingSession.code)
            if (role) logAudit({ actor: profile.name, actorRole: role, action: 'delete_qr', target: deletingSession.title })
            setDeletingCode(null)
            if (viewingCode === deletingSession.code) setViewingCode(null)
          }}
        />
      )}
    </>
  )
}

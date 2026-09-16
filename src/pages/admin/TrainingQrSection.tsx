import { useMemo, useState, type FormEvent } from 'react'
import QrCodeImage from '../../components/ui/QrCodeImage'
import { DownloadIcon, ExpandIcon, QrIcon, SearchIcon } from '../../components/ui/icons'
import { useTrainingSessions, type TrainingSession } from '../../context/TrainingSessionsContext'

function buildCheckinUrl(code: string) {
  return `${window.location.origin}${window.location.pathname}?checkin=${code}`
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

/** Khối tạo / chiếu mã QR điểm danh Training — thuộc Admin, không phải Manager. */
export default function TrainingQrSection() {
  const { sessions, addSession } = useTrainingSessions()
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionSearch, setSessionSearch] = useState('')
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({})
  const [viewingSession, setViewingSession] = useState<TrainingSession | null>(null)

  const filteredSessions = useMemo(() => {
    const keyword = sessionSearch.trim().toLowerCase()
    if (!keyword) return sessions
    return sessions.filter(
      (s) => s.title.toLowerCase().includes(keyword) || s.code.toLowerCase().includes(keyword),
    )
  }, [sessions, sessionSearch])

  function handleCreateSession(e: FormEvent) {
    e.preventDefault()
    if (!sessionTitle.trim()) return
    addSession(sessionTitle.trim(), sessionDate)
    setSessionTitle('')
    setSessionDate('')
  }

  function handleDownloadQr(session: TrainingSession) {
    const dataUrl = qrDataUrls[session.code]
    if (!dataUrl) return
    downloadDataUrl(dataUrl, `qr-${session.title.replace(/\s+/g, '-').toLowerCase()}-${session.code}.png`)
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
              Tạo buổi Training rồi chiếu mã QR lên màn hình — user quét mã bằng camera điện thoại sẽ tự động được
              ghi nhận 1 điểm DTR, không cần chờ duyệt.
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
                Đã tạo {sessions.length} buổi — bấm vào một buổi để chiếu mã QR lớn lên màn hình.
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

            <div className="flex max-h-[380px] flex-col gap-2 overflow-y-auto rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-2">
              {filteredSessions.length === 0 && (
                <p className="m-0 px-3 py-4 text-center text-[13px] text-(--text-tertiary)">
                  Không tìm thấy buổi phù hợp.
                </p>
              )}
              {filteredSessions.map((session) => (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-3.5 rounded-lg border border-transparent bg-(--surface-1) px-3.5 py-2.5 text-left transition-[border-color,box-shadow] duration-150 hover:border-[rgba(37,99,235,0.3)] hover:shadow-[0_4px_12px_var(--shadow)]"
                  key={session.code}
                  onClick={() => setViewingSession(session)}
                >
                  <div className="shrink-0 overflow-hidden rounded-md border border-[rgba(37,99,235,0.16)]">
                    <QrCodeImage
                      value={buildCheckinUrl(session.code)}
                      size={44}
                      onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [session.code]: url }))}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-['Open_Sans',sans-serif] text-sm font-bold text-(--text-primary)">
                      {session.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-(--text-tertiary)">
                      {session.date && <span>{session.date}</span>}
                      <span className="tracking-[1px] text-(--gold-bright)">Mã: {session.code}</span>
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(37,99,235,0.28)] px-3 py-1.5 text-xs font-bold text-(--gold-bright)">
                    <ExpandIcon size={13} /> Xem lớn
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {viewingSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
          onClick={() => setViewingSession(null)}
        >
          <div
            className="flex w-full max-w-[360px] flex-col items-center gap-5 rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 text-center shadow-[0_30px_60px_var(--shadow-strong)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-start justify-between gap-4">
              <div className="text-left">
                <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">
                  Chiếu mã QR điểm danh
                </div>
                <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
                  {viewingSession.title}
                </div>
              </div>
              <button
                type="button"
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
                onClick={() => setViewingSession(null)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-white p-4">
              <QrCodeImage
                value={buildCheckinUrl(viewingSession.code)}
                size={260}
                onReady={(url) => setQrDataUrls((prev) => ({ ...prev, [viewingSession.code]: url }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              {viewingSession.date && (
                <div className="text-[13px] text-(--text-tertiary)">{viewingSession.date}</div>
              )}
              <div className="text-[12.5px] tracking-[1px] text-(--gold-bright)">Mã: {viewingSession.code}</div>
            </div>

            <div className="flex w-full gap-3">
              <button
                type="button"
                className="min-h-11 flex-1 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
                onClick={() => setViewingSession(null)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
                onClick={() => handleDownloadQr(viewingSession)}
              >
                <DownloadIcon size={15} /> Tải ảnh QR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

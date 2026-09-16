import { useMemo, useState, type FormEvent } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { roleLabels, type Role } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import QrCodeImage from '../../components/QrCodeImage'
import ImportExcelModal from '../../components/ImportExcelModal'
import { DownloadIcon } from '../../components/icons'
import { useTrainingSessions } from '../../context/TrainingSessionsContext'

const roleChipClass: Record<Role, string> = {
  user: 'bg-[rgba(159,176,201,0.14)] text-(--text-secondary) border-[rgba(159,176,201,0.35)]',
  admin: 'bg-[rgba(37,99,235,0.12)] text-(--gold-bright) border-[rgba(37,99,235,0.4)]',
  manager: 'bg-[rgba(76,175,130,0.14)] text-(--positive) border-[rgba(76,175,130,0.4)]',
  support_admin: 'bg-[rgba(217,122,108,0.14)] text-(--negative) border-[rgba(217,122,108,0.4)]',
}

const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
const uRowGridClass = 'grid min-w-[720px] grid-cols-[1.2fr_1fr_1.6fr_0.9fr_0.8fr] items-center gap-3 px-6 py-4'

function buildCheckinUrl(code: string) {
  return `${window.location.origin}${window.location.pathname}?checkin=${code}`
}

export default function AdminUsersPanel() {
  const { submissions, users } = useSubmissions()
  const { sessions, addSession } = useTrainingSessions()
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)

  const userTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const s of submissions) {
      if (s.status !== 'approved') continue
      totals.set(s.userName, (totals.get(s.userName) ?? 0) + s.points)
    }
    return totals
  }, [submissions])

  function handleCreateSession(e: FormEvent) {
    e.preventDefault()
    if (!sessionTitle.trim()) return
    addSession(sessionTitle.trim(), sessionDate)
    setSessionTitle('')
    setSessionDate('')
  }

  function handleExportUsers() {
    exportCsv(
      `danh-sach-nguoi-dung-dtr-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Họ tên', 'Phòng', 'Email', 'Vai trò', 'Tổng điểm'],
      users.map((u) => [
        u.name,
        u.room ?? '—',
        u.email,
        roleLabels[u.role],
        formatPoints(userTotals.get(u.name) ?? 0),
      ]),
    )
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Quản lý người dùng
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Danh sách người dùng và vai trò tương ứng trong hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnSecondaryClass} onClick={() => setShowImportModal(true)}>
            Nhập từ Excel
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 ${btnPrimaryClass}`}
            onClick={handleExportUsers}
          >
            <DownloadIcon size={15} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
        <div
          className={`${uRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}
        >
          <div>Họ tên</div>
          <div>Phòng</div>
          <div>Email</div>
          <div>Vai trò</div>
          <div>Tổng điểm</div>
        </div>
        {users.map((user) => (
          <div className={`${uRowGridClass} border-t border-(--hairline)`} key={user.id}>
            <div className="text-sm font-bold text-(--text-primary)">{user.name}</div>
            <div className="text-[13.5px] font-semibold text-(--text-secondary)">{user.room ?? '—'}</div>
            <div className="text-[13.5px] text-(--text-tertiary)">{user.email}</div>
            <div>
              <span
                className={`inline-flex w-fit rounded-full border px-[13px] py-[7px] text-xs font-bold ${roleChipClass[user.role]}`}
              >
                {roleLabels[user.role]}
              </span>
            </div>
            <div className="font-['Open_Sans',sans-serif] text-sm font-extrabold text-(--gold-bright)">
              {formatPoints(userTotals.get(user.name) ?? 0)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-4.5 border-t border-[rgba(37,99,235,0.16)] pt-7">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-xl font-extrabold tracking-[0.5px] text-(--text-primary)">
            Tạo mã QR điểm danh Training / Kick off
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Tạo buổi Training rồi chiếu mã QR lên màn hình — user quét mã bằng camera điện thoại sẽ tự động được ghi
            nhận 1 điểm DTR, không cần chờ duyệt.
          </p>
        </div>

        <form className="flex flex-wrap gap-2.5" onSubmit={handleCreateSession}>
          <input
            className="min-w-[180px] flex-1 rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
            type="text"
            placeholder="Tên buổi Training / Kick off"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            required
          />
          <input
            className="min-w-[180px] flex-1 rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
          />
          <button
            type="submit"
            className="cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5.5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
          >
            Tạo mã QR
          </button>
        </form>

        {sessions.length === 0 ? (
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">Chưa có buổi Training nào được tạo.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {sessions.map((session) => (
              <div
                className="flex flex-col items-center gap-3 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) p-4.5 text-center"
                key={session.code}
              >
                <QrCodeImage value={buildCheckinUrl(session.code)} />
                <div>
                  <div className="font-['Open_Sans',sans-serif] text-sm font-bold text-(--text-primary)">
                    {session.title}
                  </div>
                  {session.date && (
                    <div className="mt-0.5 text-[12.5px] text-(--text-tertiary)">{session.date}</div>
                  )}
                  <div className="mt-1 text-[11.5px] tracking-[1px] text-(--gold-bright)">Mã: {session.code}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showImportModal && (
        <ImportExcelModal
          eyebrow="Quản lý người dùng"
          title="Nhập danh sách người dùng từ Excel"
          description="Tải lên file danh sách người dùng để tạo tài khoản hàng loạt thay vì nhập tay từng người."
          columns={['Họ tên', 'Phòng', 'Email', 'Vai trò']}
          sampleRows={[
            ['Nguyễn Văn Bình', 'Phòng Kinh doanh 1', 'binh.nguyen@dtr.vn', 'Người dùng'],
            ['Lê Thị Cẩm', 'Phòng Kinh doanh 2', 'cam.le@dtr.vn', 'Người dùng'],
          ]}
          templateFilename="mau-nhap-nguoi-dung-dtr.csv"
          onCancel={() => setShowImportModal(false)}
          onImport={() => {
            // TODO: đọc và parse file Excel thành danh sách người dùng khi có thư viện xử lý file ở backend/BE.
            setShowImportModal(false)
          }}
        />
      )}
    </section>
  )
}

import { useMemo, useState, type FormEvent } from 'react'
import { useSubmissions } from '../../context/SubmissionsContext'
import { roleLabels } from '../../types/dtr'
import { formatPoints } from '../../utils/format'
import { exportCsv } from '../../utils/exportCsv'
import QrCodeImage from '../../components/QrCodeImage'
import ImportExcelModal from '../../components/ImportExcelModal'
import { DownloadIcon } from '../../components/icons'
import { useTrainingSessions } from '../../context/TrainingSessionsContext'
import '../../styles/shared.css'
import './admin.css'

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
      ['Họ tên', 'Email', 'Vai trò', 'Tổng điểm'],
      users.map((u) => [u.name, u.email, roleLabels[u.role], formatPoints(userTotals.get(u.name) ?? 0)]),
    )
  }

  return (
    <section className="content-section">
      <div className="panel-head">
        <div>
          <div className="section-title">Quản lý người dùng</div>
          <p className="section-caption">Danh sách người dùng và vai trò tương ứng trong hệ thống.</p>
        </div>
        <div className="panel-head-actions">
          <button type="button" className="btn-secondary" onClick={() => setShowImportModal(true)}>
            Nhập từ Excel
          </button>
          <button type="button" className="btn-primary report-export-btn" onClick={handleExportUsers}>
            <DownloadIcon size={15} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="u-row u-head">
          <div>Họ tên</div>
          <div>Email</div>
          <div>Vai trò</div>
          <div>Tổng điểm</div>
        </div>
        {users.map((user) => (
          <div className="u-row u-body" key={user.id}>
            <div className="u-name">{user.name}</div>
            <div className="u-email">{user.email}</div>
            <div>
              <span className={`role-chip role-chip-${user.role}`}>{roleLabels[user.role]}</span>
            </div>
            <div className="u-points">{formatPoints(userTotals.get(user.name) ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="qr-block">
        <div>
          <div className="section-title" style={{ fontSize: 20 }}>
            Tạo mã QR điểm danh Training / Kick off
          </div>
          <p className="section-caption">
            Tạo buổi Training rồi chiếu mã QR lên màn hình — user quét mã bằng camera điện thoại sẽ
            tự động được ghi nhận 1 điểm DTR, không cần chờ duyệt.
          </p>
        </div>

        <form className="qr-form" onSubmit={handleCreateSession}>
          <input
            className="qr-input"
            type="text"
            placeholder="Tên buổi Training / Kick off"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            required
          />
          <input
            className="qr-input"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
          />
          <button type="submit" className="qr-submit">
            Tạo mã QR
          </button>
        </form>

        {sessions.length === 0 ? (
          <p className="section-caption">Chưa có buổi Training nào được tạo.</p>
        ) : (
          <div className="qr-session-grid">
            {sessions.map((session) => (
              <div className="qr-session-card" key={session.code}>
                <QrCodeImage value={buildCheckinUrl(session.code)} />
                <div className="qr-session-info">
                  <div className="qr-session-title">{session.title}</div>
                  {session.date && <div className="qr-session-date">{session.date}</div>}
                  <div className="qr-session-code">Mã: {session.code}</div>
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
          columns={['Họ tên', 'Email', 'Vai trò']}
          sampleRows={[
            ['Nguyễn Văn Bình', 'binh.nguyen@dtr.vn', 'Người dùng'],
            ['Lê Thị Cẩm', 'cam.le@dtr.vn', 'Người dùng'],
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

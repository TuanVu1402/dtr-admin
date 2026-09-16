/** Nhật ký thao tác FE — duyệt, QR, khóa tài khoản. */
import { useMemo, useState } from 'react'
import { useAudit, auditActionLabels } from '../../context/AuditContext'
import { roleLabels } from '../../types/dtr'
import { exportCsv } from '../../utils/exportCsv'

export default function AuditPanel() {
  const { events } = useAudit()
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.actor.toLowerCase().includes(q) ||
        e.target.toLowerCase().includes(q) ||
        auditActionLabels[e.action].toLowerCase().includes(q) ||
        (e.detail ?? '').toLowerCase().includes(q),
    )
  }, [events, keyword])

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Nhật ký thao tác
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Ghi nhận duyệt điểm, QR, khóa tài khoản, nhập Excel — lưu trên trình duyệt.
          </p>
        </div>
        <button
          type="button"
          className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary) disabled:opacity-40"
          disabled={filtered.length === 0}
          onClick={() =>
            exportCsv(
              `nhat-ky-dtr-${new Date().toISOString().slice(0, 10)}.csv`,
              ['Thời gian', 'Người thao tác', 'Vai trò', 'Hành động', 'Đối tượng', 'Chi tiết'],
              filtered.map((e) => [e.at, e.actor, roleLabels[e.actorRole], auditActionLabels[e.action], e.target, e.detail ?? '']),
            )
          }
        >
          Xuất Excel
        </button>
      </div>

      <input
        className="max-w-[360px] rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
        placeholder="Tìm theo người, hành động, đối tượng..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
        <div className="grid min-w-[860px] grid-cols-[1.2fr_1fr_1.1fr_1.4fr_1.6fr] items-center gap-3 bg-[rgba(37,99,235,0.08)] px-6 py-4 text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase">
          <div>Thời gian</div>
          <div>Người thao tác</div>
          <div>Hành động</div>
          <div>Đối tượng</div>
          <div>Chi tiết</div>
        </div>
        {filtered.length === 0 && (
          <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Chưa có nhật ký nào.</p>
        )}
        {filtered.map((e) => (
          <div
            className="grid min-w-[860px] grid-cols-[1.2fr_1fr_1.1fr_1.4fr_1.6fr] items-center gap-3 border-t border-(--hairline) px-6 py-3.5"
            key={e.id}
          >
            <div className="text-[12.5px] text-(--text-secondary)">{e.at}</div>
            <div>
              <div className="text-[13px] font-bold text-(--text-primary)">{e.actor}</div>
              <div className="text-[11.5px] text-(--text-muted)">{roleLabels[e.actorRole]}</div>
            </div>
            <div className="text-[13px] font-bold text-(--gold-bright)">{auditActionLabels[e.action]}</div>
            <div className="text-[13px] text-(--text-primary)">{e.target}</div>
            <div className="text-[12.5px] text-(--text-tertiary)">{e.detail ?? '—'}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

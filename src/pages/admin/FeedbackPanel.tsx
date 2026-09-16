import { useMemo, useState } from 'react'
import { useFeedback } from '../../context/FeedbackContext'
import { useAuth } from '../../context/AuthContext'
import { useAudit } from '../../context/AuditContext'
import { useNotifications } from '../../context/NotificationsContext'
import { useSubmissions } from '../../context/SubmissionsContext'
import { feedbackTypeLabels, type FeedbackEntry, type FeedbackStatus } from '../../types/dtr'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/ui/SortableHeaderCell'
import SearchableSelect from '../../components/form/SearchableSelect'

const statusFilters: { label: string; value: FeedbackStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa xử lý', value: 'new' },
  { label: 'Đã xử lý', value: 'resolved' },
]

const fRowGridClass = 'grid min-w-[1080px] grid-cols-[0.9fr_2fr_1.1fr_1fr_0.9fr_1.1fr_1.3fr] items-center gap-3 px-6 py-4'
const actionBtnBase = "cursor-pointer rounded-lg border px-3 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold"
const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"

type FeedbackSortKey = 'type' | 'email' | 'date' | 'status'

export default function FeedbackPanel() {
  const { feedbackList, setFeedbackStatus, updateFeedback } = useFeedback()
  const { users } = useSubmissions()
  const { profile, role } = useAuth()
  const { logAudit } = useAudit()
  const { pushNotification } = useNotifications()
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<FeedbackSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [working, setWorking] = useState<FeedbackEntry | null>(null)
  const [reply, setReply] = useState('')
  const [assignee, setAssignee] = useState('')
  const [sendMail, setSendMail] = useState(true)

  const staff = users.filter((u) => u.role === 'admin' || u.role === 'support_admin' || u.role === 'manager')

  const stats = useMemo(() => {
    return {
      total: feedbackList.length,
      new: feedbackList.filter((f) => f.status === 'new').length,
      resolved: feedbackList.filter((f) => f.status === 'resolved').length,
    }
  }, [feedbackList])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return feedbackList
    return feedbackList.filter((f) => f.status === statusFilter)
  }, [feedbackList, statusFilter])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const getValue = (f: FeedbackEntry): string => {
      switch (sortKey) {
        case 'type':
          return feedbackTypeLabels[f.type]
        case 'email':
          return f.email ?? ''
        case 'date':
          return f.createdAt
        case 'status':
          return f.status
      }
    }
    return [...filtered].sort((a, b) => compareValues(getValue(a), getValue(b), sortDir))
  }, [filtered, sortKey, sortDir])

  function handleSort(key: FeedbackSortKey) {
    const next = nextSortState(sortKey, sortDir, key)
    setSortKey(next.key)
    setSortDir(next.dir)
  }

  function openWork(entry: FeedbackEntry) {
    setWorking(entry)
    setReply(entry.reply ?? '')
    setAssignee(entry.assignedTo ?? profile.name)
    setSendMail(true)
  }

  function saveWork() {
    if (!working || !role) return
    updateFeedback(working.id, {
      reply: reply.trim() || undefined,
      repliedAt: reply.trim() ? new Date().toLocaleString('vi-VN') : working.repliedAt,
      assignedTo: assignee || undefined,
      emailSentAt: sendMail && working.email ? new Date().toLocaleString('vi-VN') : working.emailSentAt,
      status: 'resolved',
    })
    logAudit({
      actor: profile.name,
      actorRole: role,
      action: 'reply_feedback',
      target: working.email ?? working.id,
      detail: sendMail && working.email ? `Gửi mail (mô phỏng) + gán ${assignee}` : `Gán ${assignee}`,
    })
    pushNotification({
      kind: 'success',
      title: 'Đã xử lý phản hồi',
      description: sendMail && working.email ? `Đã mô phỏng gửi mail tới ${working.email}` : working.content.slice(0, 80),
    })
    setWorking(null)
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-4 max-[640px]:pt-5">
      <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] tracking-[0.5px] text-(--text-primary)">
        Phản hồi từ người dùng
      </div>
      <p className="m-0 text-sm font-medium text-(--text-tertiary) max-[640px]:hidden">
        Trả lời, gán người xử lý, gửi mail mô phỏng. Không có SMTP thật.
      </p>

      <div className="grid grid-cols-3 gap-4 max-[640px]:gap-2">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--gold-bright)">{stats.new}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Chưa xử lý</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--positive)">{stats.resolved}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Đã xử lý</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5 max-[640px]:rounded-xl max-[640px]:px-2.5 max-[640px]:py-3">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] text-(--text-primary)">{stats.total}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng số</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-inherit text-[13px] font-bold max-[640px]:px-3 max-[640px]:py-1.5 max-[640px]:text-[12.5px] ${
              filter.value === statusFilter
                ? 'border-(--gold) bg-(--gold) text-(--on-gold)'
                : 'border-[rgba(37,99,235,0.25)] bg-transparent text-(--text-secondary)'
            }`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[rgba(37,99,235,0.18)]">
        <div className={`${fRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}>
          <SortableHeaderCell label="Loại" sortKey="type" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Nội dung</div>
          <SortableHeaderCell label="Email" sortKey="email" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Thời gian gửi" sortKey="date" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Trạng thái" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Người xử lý</div>
          <div>Xử lý</div>
        </div>
        {sorted.length === 0 && <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Chưa có phản hồi nào.</p>}
        {sorted.map((f) => (
          <div className={`${fRowGridClass} border-t border-(--hairline)`} key={f.id}>
            <div className="text-[13.5px] font-bold text-(--gold-bright)">{feedbackTypeLabels[f.type]}</div>
            <div className="text-[13.5px] leading-[1.5] text-(--text-primary)">
              {f.content}
              {f.reply && <div className="mt-1 text-[12px] text-(--text-tertiary)">Trả lời: {f.reply}</div>}
            </div>
            <div className="text-[13.5px] text-(--text-tertiary)">{f.email ?? '—'}</div>
            <div className="text-[13px] text-(--text-secondary)">{f.createdAt}</div>
            <div>
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-[13px] py-[7px] text-xs font-bold ${
                  f.status === 'resolved'
                    ? 'border-[rgba(76,175,130,0.4)] bg-[rgba(76,175,130,0.14)] text-(--positive)'
                    : 'border-[rgba(37,99,235,0.4)] bg-[rgba(37,99,235,0.12)] text-(--gold-bright)'
                }`}
              >
                {f.status === 'resolved' ? 'Đã xử lý' : 'Chưa xử lý'}
              </span>
            </div>
            <div className="text-[12.5px] text-(--text-secondary)">
              {f.assignedTo ?? '—'}
              {f.emailSentAt && <div className="text-[11px] text-(--text-muted)">Mail: {f.emailSentAt}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${actionBtnBase} border-[rgba(37,99,235,0.3)] bg-transparent text-(--gold-bright)`}
                onClick={() => openWork(f)}
              >
                Trả lời
              </button>
              <button
                type="button"
                className={`${actionBtnBase} ${
                  f.status === 'resolved'
                    ? 'border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.14)] text-(--negative)'
                    : 'border-[rgba(76,175,130,0.4)] bg-[rgba(76,175,130,0.14)] text-(--positive)'
                }`}
                onClick={() => setFeedbackStatus(f.id, f.status === 'resolved' ? 'new' : 'resolved')}
              >
                {f.status === 'resolved' ? 'Mở lại' : 'Đã xử lý'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {working && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px] max-[640px]:items-end max-[640px]:p-0" onClick={() => setWorking(null)}>
          <div
            className="flex w-full max-w-[520px] flex-col gap-4 rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 max-[640px]:max-h-[92svh] max-[640px]:overflow-y-auto max-[640px]:rounded-b-none max-[640px]:p-5 max-[640px]:pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-['Open_Sans',sans-serif] text-lg font-bold text-(--text-primary)">Xử lý phản hồi</div>
            <p className="m-0 text-[13.5px] text-(--text-secondary)">{working.content}</p>
            <SearchableSelect
              options={staff.map((u) => ({ value: u.name, label: u.name }))}
              value={assignee}
              onChange={setAssignee}
              placeholder="Gán người xử lý..."
            />
            <textarea className={`${fieldInputClass} min-h-[90px] resize-y`} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Nội dung trả lời..." />
            <label className="flex items-center gap-2 text-[13px] text-(--text-secondary)">
              <input type="checkbox" checked={sendMail} onChange={(e) => setSendMail(e.target.checked)} disabled={!working.email} />
              Gửi mail mô phỏng {working.email ? `tới ${working.email}` : '(không có email)'}
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
                onClick={() => setWorking(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
                onClick={saveWork}
              >
                Lưu &amp; đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

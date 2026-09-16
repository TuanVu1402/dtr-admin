import { useMemo, useState } from 'react'
import { useFeedback } from '../../context/FeedbackContext'
import { feedbackTypeLabels, type FeedbackEntry, type FeedbackStatus } from '../../types/dtr'
import SortableHeaderCell, { compareValues, nextSortState, type SortDir } from '../../components/ui/SortableHeaderCell'

const statusFilters: { label: string; value: FeedbackStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa xử lý', value: 'new' },
  { label: 'Đã xử lý', value: 'resolved' },
]

const fRowGridClass = 'grid min-w-[900px] grid-cols-[1fr_2.4fr_1.3fr_1.1fr_1fr_1.3fr] items-center gap-3 px-6 py-4'
const actionBtnBase = "cursor-pointer rounded-lg border px-3 py-2 font-['Open_Sans',sans-serif] text-[12.5px] font-bold"

type FeedbackSortKey = 'type' | 'email' | 'date' | 'status'

export default function FeedbackPanel() {
  const { feedbackList, setFeedbackStatus } = useFeedback()
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<FeedbackSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
        Phản hồi từ người dùng
      </div>
      <p className="m-0 text-sm font-medium text-(--text-tertiary)">
        Báo lỗi và góp ý người dùng gửi từ Trang chủ User.
      </p>

      <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--gold-bright)">{stats.new}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Chưa xử lý</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--positive)">{stats.resolved}</div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Đã xử lý</div>
        </div>
        <div className="rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-tint) px-5.5 py-5">
          <div className="font-['Open_Sans',sans-serif] text-[30px] font-extrabold text-(--text-primary)">
            {stats.total}
          </div>
          <div className="mt-1 text-[13px] font-semibold text-(--text-tertiary)">Tổng số</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`cursor-pointer rounded-full border px-4.5 py-2.5 font-inherit text-[13px] font-bold ${
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
        <div
          className={`${fRowGridClass} bg-[rgba(37,99,235,0.08)] text-xs font-extrabold tracking-[0.8px] text-(--gold-bright) uppercase`}
        >
          <SortableHeaderCell label="Loại" sortKey="type" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Nội dung</div>
          <SortableHeaderCell label="Email" sortKey="email" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Thời gian gửi" sortKey="date" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <SortableHeaderCell label="Trạng thái" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
          <div>Xử lý</div>
        </div>
        {sorted.length === 0 && (
          <p className="px-6 py-5 text-sm font-medium text-(--text-tertiary)">Chưa có phản hồi nào.</p>
        )}
        {sorted.map((f) => (
          <div className={`${fRowGridClass} border-t border-(--hairline)`} key={f.id}>
            <div className="text-[13.5px] font-bold text-(--gold-bright)">{feedbackTypeLabels[f.type]}</div>
            <div className="text-[13.5px] leading-[1.5] text-(--text-primary)">{f.content}</div>
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
            <div>
              <button
                type="button"
                className={`${actionBtnBase} ${
                  f.status === 'resolved'
                    ? 'border-[rgba(217,122,108,0.4)] bg-[rgba(217,122,108,0.14)] text-(--negative)'
                    : 'border-[rgba(76,175,130,0.4)] bg-[rgba(76,175,130,0.14)] text-(--positive)'
                }`}
                onClick={() => setFeedbackStatus(f.id, f.status === 'resolved' ? 'new' : 'resolved')}
              >
                {f.status === 'resolved' ? 'Mở lại' : 'Đánh dấu đã xử lý'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

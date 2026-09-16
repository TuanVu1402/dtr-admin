import type { SubmissionStatus } from '../types/dtr'

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  approved: {
    label: 'Đã duyệt',
    className: 'bg-[rgba(76,175,130,0.14)] text-(--positive) border-[rgba(76,175,130,0.4)]',
  },
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-[rgba(37,99,235,0.12)] text-(--gold-bright) border-[rgba(37,99,235,0.4)]',
  },
  rejected: {
    label: 'Từ chối',
    className: 'bg-[rgba(217,122,108,0.14)] text-(--negative) border-[rgba(217,122,108,0.4)]',
  },
}

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-[13px] py-[7px] text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  )
}

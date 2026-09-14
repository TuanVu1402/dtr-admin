import type { SubmissionStatus } from '../types/dtr'

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  approved: { label: 'Đã duyệt', className: 'badge-approved' },
  pending: { label: 'Chờ duyệt', className: 'badge-pending' },
  rejected: { label: 'Từ chối', className: 'badge-rejected' },
}

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config = statusConfig[status]
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

export type SortDir = 'asc' | 'desc'

type SortableHeaderCellProps<K extends string> = {
  label: string
  sortKey: K
  activeKey: K | null
  dir: SortDir
  onSort: (key: K) => void
}

/** Ô tiêu đề bảng bấm được để sắp xếp — dùng chung cho mọi bảng trong khu Admin
 * (danh sách người dùng, chấm điểm, phản hồi...) để thao tác sắp xếp nhất quán. */
export default function SortableHeaderCell<K extends string>({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: SortableHeaderCellProps<K>) {
  const isActive = activeKey === sortKey
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-inherit text-inherit uppercase"
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className={`text-[10px] leading-none ${isActive ? 'text-(--gold-bright)' : 'opacity-40'}`}>
        {isActive ? (dir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  )
}

/** Đảo hướng sắp xếp nếu bấm lại cùng cột, hoặc đổi sang cột mới với chiều tăng dần. */
export function nextSortState<K extends string>(
  activeKey: K | null,
  dir: SortDir,
  clickedKey: K,
): { key: K; dir: SortDir } {
  if (activeKey === clickedKey) {
    return { key: clickedKey, dir: dir === 'asc' ? 'desc' : 'asc' }
  }
  return { key: clickedKey, dir: 'asc' }
}

export function compareValues(a: string | number, b: string | number, dir: SortDir): number {
  let result: number
  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b
  } else {
    result = String(a).localeCompare(String(b), 'vi')
  }
  return dir === 'asc' ? result : -result
}

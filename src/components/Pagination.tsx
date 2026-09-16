type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function buildPageList(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const list: (number | '…')[] = [1]
  if (page > 3) list.push('…')
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  for (let i = start; i <= end; i++) list.push(i)
  if (page < totalPages - 2) list.push('…')
  list.push(totalPages)
  return list
}

const navBtnClass =
  "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border border-[rgba(37,99,235,0.28)] bg-transparent px-2.5 font-['Open_Sans',sans-serif] text-[12.5px] font-bold text-(--text-secondary) transition-[background,border-color] duration-150 hover:border-[rgba(37,99,235,0.45)] hover:bg-[rgba(37,99,235,0.08)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"

/** Phân trang theo số trang (1 2 3 4 5...) — dùng chung cho mọi bảng trong khu Admin
 * thay cho kiểu "xem thêm" trước đây. */
export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = buildPageList(page, totalPages)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      <button
        type="button"
        className={navBtnClass}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        ‹
      </button>
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-[12.5px] text-(--text-tertiary)">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={
              p === page
                ? "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border border-(--gold) bg-(--gold) px-2.5 font-['Open_Sans',sans-serif] text-[12.5px] font-extrabold text-(--on-gold)"
                : navBtnClass
            }
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={navBtnClass}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>
    </nav>
  )
}

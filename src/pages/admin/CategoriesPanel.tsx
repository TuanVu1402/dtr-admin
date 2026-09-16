/** Trang cấu hình hạng mục điểm (bật/tắt, sửa điểm). */
import { useMemo, useState } from 'react'
import { useCategories } from '../../context/CategoriesContext'
import { useAudit } from '../../context/AuditContext'
import { useAuth } from '../../context/AuthContext'
import { formatPoints } from '../../utils/format'
import type { Category } from '../../types/dtr'

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) focus:border-(--gold) focus:outline-none"
const btnSecondaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"

export default function CategoriesPanel() {
  const { categories, updateCategory, resetCategories } = useCategories()
  const { logAudit } = useAudit()
  const { profile, role } = useAuth()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = useMemo(() => categories.find((c) => c.id === editingId) ?? null, [categories, editingId])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pointsText, setPointsText] = useState('')

  function startEdit(category: Category) {
    setEditingId(category.id)
    setTitle(category.title)
    setDescription(category.description)
    setPointsText(category.pointOptions.map((p) => `${p.label}:${p.points}`).join(', '))
  }

  function parsePoints(text: string): Category['pointOptions'] {
    return text
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [label, pts] = chunk.split(':').map((part) => part.trim())
        const points = Number(String(pts ?? '0').replace(',', '.'))
        return { label: label || 'Điểm', points: Number.isFinite(points) ? points : 0 }
      })
  }

  function saveEdit() {
    if (!editing || !role) return
    const pointOptions = parsePoints(pointsText)
    if (pointOptions.length === 0) return
    updateCategory(editing.id, { title: title.trim() || editing.title, description: description.trim(), pointOptions })
    logAudit({
      actor: profile.name,
      actorRole: role,
      action: 'update_category',
      target: title.trim() || editing.title,
      detail: pointOptions.map((p) => `${p.label} ${p.points}`).join(', '),
    })
    setEditingId(null)
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 max-[640px]:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
            Hạng mục điểm
          </div>
          <p className="m-0 text-sm font-medium text-(--text-tertiary)">
            Bật/tắt hạng mục, sửa điểm. Sale chỉ thấy hạng mục đang mở.
          </p>
        </div>
        <button type="button" className={btnSecondaryClass} onClick={resetCategories}>
          Khôi phục mặc định
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const enabled = category.enabled !== false
          return (
            <div
              className="flex flex-col gap-3 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-1) p-5"
              key={category.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold tracking-[1px] text-(--gold-bright)">{category.number}</span>
                    <span className="font-['Open_Sans',sans-serif] text-[15px] font-extrabold text-(--text-primary)">
                      {category.title}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10.5px] font-extrabold ${
                        enabled
                          ? 'border-[rgba(20,108,62,0.35)] bg-[rgba(20,108,62,0.1)] text-(--positive)'
                          : 'border-[rgba(169,47,33,0.35)] bg-[rgba(169,47,33,0.1)] text-(--negative)'
                      }`}
                    >
                      {enabled ? 'Đang mở' : 'Đã tắt'}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-[13px] text-(--text-tertiary)">{category.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {category.pointOptions.map((opt) => (
                      <span
                        className="rounded-full border border-[rgba(37,99,235,0.25)] px-2.5 py-1 text-[12px] font-bold text-(--gold-bright)"
                        key={`${category.id}-${opt.label}`}
                      >
                        {opt.label}: {formatPoints(opt.points)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btnSecondaryClass}
                    onClick={() => {
                      updateCategory(category.id, { enabled: !enabled })
                      if (role) {
                        logAudit({
                          actor: profile.name,
                          actorRole: role,
                          action: 'update_category',
                          target: category.title,
                          detail: enabled ? 'Tắt hạng mục' : 'Bật hạng mục',
                        })
                      }
                    }}
                  >
                    {enabled ? 'Tắt' : 'Bật'}
                  </button>
                  <button type="button" className={btnSecondaryClass} onClick={() => startEdit(category)}>
                    Sửa điểm
                  </button>
                </div>
              </div>

              {editing?.id === category.id && (
                <div className="flex flex-col gap-3 rounded-xl border border-[rgba(37,99,235,0.16)] bg-(--surface-tint) p-4">
                  <input className={fieldInputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                  <textarea
                    className={`${fieldInputClass} min-h-[72px] resize-y`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input
                    className={fieldInputClass}
                    value={pointsText}
                    onChange={(e) => setPointsText(e.target.value)}
                    placeholder="Booking:4, Giao dịch:5"
                  />
                  <p className="m-0 text-[12px] text-(--text-muted)">Định dạng: Nhãn:điểm, cách nhau bởi dấu phẩy.</p>
                  <div className="flex gap-2">
                    <button type="button" className={btnSecondaryClass} onClick={() => setEditingId(null)}>
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"
                      onClick={saveEdit}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

import { useState, type ChangeEvent, type DragEvent } from 'react'
import { DownloadIcon, SheetIcon, UploadIcon } from '../ui/icons'
import { exportCsv } from '../../utils/exportCsv'

type ImportExcelModalProps = {
  eyebrow: string
  title: string
  description: string
  columns: string[]
  sampleRows: (string | number)[][]
  templateFilename: string
  onCancel: () => void
  onImport: (file: File) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ImportExcelModal({
  eyebrow,
  title,
  description,
  columns,
  sampleRows,
  templateFilename,
  onCancel,
  onImport,
}: ImportExcelModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  function pickFile(nextFile: File | null) {
    setFile(nextFile)
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    pickFile(e.target.files?.[0] ?? null)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setIsDragOver(false)
    pickFile(e.dataTransfer.files?.[0] ?? null)
  }

  function handleImportClick() {
    if (!file) return
    onImport(file)
  }

  function handleDownloadTemplate() {
    exportCsv(templateFilename, columns, sampleRows)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--scrim) p-6 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="flex w-full max-w-[480px] max-h-[90svh] flex-col gap-5 overflow-y-auto rounded-[18px] border border-[rgba(37,99,235,0.32)] bg-[linear-gradient(160deg,var(--surface-1),var(--surface-2))] p-7 shadow-[0_30px_60px_var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold tracking-[1.4px] text-(--gold-bright) uppercase">{eyebrow}</div>
            <div className="mt-1.5 font-['Open_Sans',sans-serif] text-lg leading-[1.35] font-bold text-(--text-primary)">
              {title}
            </div>
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-xl leading-none text-(--gold-bright)"
            onClick={onCancel}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <p className="m-0 text-sm font-medium text-(--text-tertiary)">{description}</p>

        <div className="flex flex-col gap-2.5 rounded-[10px] border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.06)] px-4 py-3.5">
          <div className="text-[11.5px] font-bold tracking-[0.4px] text-(--text-secondary)">Các cột cần có trong file</div>
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <span
                className="rounded-full border border-[rgba(37,99,235,0.35)] bg-[rgba(37,99,235,0.08)] px-2.5 py-1 text-xs font-semibold text-(--gold-bright)"
                key={col}
              >
                {col}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 self-start border-none bg-none p-0 text-[12.5px] font-bold text-(--gold-bright) hover:underline"
            onClick={handleDownloadTemplate}
          >
            <DownloadIcon size={14} />
            Tải file mẫu
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12.5px] font-bold text-(--text-secondary)">File Excel</label>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[rgba(37,99,235,0.4)] text-center text-(--text-tertiary) hover:border-(--gold) hover:bg-[rgba(37,99,235,0.06)] ${
              file ? 'px-4 py-3.5' : 'px-4.5 py-6.5'
            } ${isDragOver ? 'border-(--gold) bg-[rgba(37,99,235,0.06)]' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
            {file ? (
              <div className="flex w-full cursor-default items-center gap-3">
                <SheetIcon size={22} />
                <div className="flex flex-1 flex-col gap-0.5 text-left">
                  <div className="text-[13.5px] font-bold break-all text-(--text-primary)">{file.name}</div>
                  <div className="text-[11.5px] text-(--text-tertiary)">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="h-[26px] w-[26px] shrink-0 cursor-pointer rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent text-[15px] leading-none text-(--gold-bright)"
                  onClick={(e) => {
                    e.preventDefault()
                    pickFile(null)
                  }}
                  aria-label="Bỏ chọn file"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <UploadIcon size={26} />
                <span className="text-[13.5px] font-semibold text-(--text-secondary)">
                  Kéo thả file vào đây hoặc bấm để chọn file
                </span>
                <span className="text-[11.5px] text-(--text-muted)">Hỗ trợ .xlsx, .xls, .csv — tối đa 5MB</span>
              </>
            )}
          </label>
        </div>

        <div className="mt-1 flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--text-secondary)"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold) disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!file}
            onClick={handleImportClick}
          >
            Nhập dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}

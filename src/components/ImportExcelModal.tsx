import { useState, type ChangeEvent, type DragEvent } from 'react'
import { DownloadIcon, SheetIcon, UploadIcon } from './icons'
import { exportCsv } from '../utils/exportCsv'
import '../styles/shared.css'
import './ImportExcelModal.css'

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
    <div className="form-overlay" onClick={onCancel}>
      <div className="form-card" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <div>
            <div className="form-eyebrow">{eyebrow}</div>
            <div className="form-title">{title}</div>
          </div>
          <button type="button" className="form-close" onClick={onCancel} aria-label="Đóng">
            ×
          </button>
        </div>

        <p className="section-caption">{description}</p>

        <div className="excel-columns-box">
          <div className="excel-columns-title">Các cột cần có trong file</div>
          <div className="excel-columns-tags">
            {columns.map((col) => (
              <span className="excel-col-tag" key={col}>
                {col}
              </span>
            ))}
          </div>
          <button type="button" className="excel-template-link" onClick={handleDownloadTemplate}>
            <DownloadIcon size={14} />
            Tải file mẫu
          </button>
        </div>

        <div className="field">
          <label className="field-label">File Excel</label>
          <label
            className={`excel-dropzone${file ? ' has-file' : ''}${isDragOver ? ' drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileInput} />
            {file ? (
              <div className="excel-file-chip">
                <SheetIcon size={22} />
                <div className="excel-file-info">
                  <div className="excel-file-name">{file.name}</div>
                  <div className="excel-file-size">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="excel-file-remove"
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
                <span className="excel-dropzone-text">Kéo thả file vào đây hoặc bấm để chọn file</span>
                <span className="excel-dropzone-hint">Hỗ trợ .xlsx, .xls, .csv — tối đa 5MB</span>
              </>
            )}
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="button" className="btn-primary" disabled={!file} onClick={handleImportClick}>
            Nhập dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}

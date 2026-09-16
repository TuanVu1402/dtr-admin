import type { Role, SubmissionStatus } from '../types/dtr'

/** Tách một dòng CSV, tôn trọng dấu ngoặc kép. */
export function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

export function parseCsvText(text: string): string[][] {
  const cleaned = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return cleaned
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map(splitCsvLine)
}

export function parseRoleLabel(text: string): Role {
  const n = text.trim().toLowerCase()
  if (n.includes('support')) return 'support_admin'
  if ((n === 'admin' || n.includes('quản trị')) && !n.includes('support')) return 'admin'
  if (n.includes('manager') || n.includes('quản lý')) return 'manager'
  return 'user'
}

export function parseStatusLabel(text: string): SubmissionStatus {
  const n = text.trim().toLowerCase()
  if (n.includes('duyệt') && !n.includes('chờ') && !n.includes('từ')) return 'approved'
  if (n.includes('approved')) return 'approved'
  if (n.includes('từ chối') || n.includes('reject')) return 'rejected'
  return 'pending'
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Không đọc được file'))
    reader.readAsText(file, 'UTF-8')
  })
}

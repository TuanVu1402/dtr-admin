/** Đồng bộ dữ liệu nhỏ giữa 2 app demo (user :5173 / admin :517x).
 * localStorage không chung origin khi khác cổng. Cookie trên localhost thì không phân biệt cổng,
 * nên ghi kèm cookie (giới hạn ~3.5KB) + poll định kỳ để tab kia nhận được. */

type Envelope<T> = { t: number; d: T }

const COOKIE_MAX = 3500

function cookieName(key: string) {
  return `dtr_${key.replace(/[^a-z0-9]/gi, '').slice(-12)}`
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  const hit = document.cookie.split('; ').find((c) => c.startsWith(prefix))
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : null
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`
}

function parseEnvelope<T>(raw: string | null): Envelope<T> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Envelope<T> | T
    if (parsed && typeof parsed === 'object' && 't' in parsed && 'd' in parsed) {
      return parsed as Envelope<T>
    }
    return { t: 0, d: parsed as T }
  } catch {
    return null
  }
}

export function readShared<T>(key: string, fallback: T): T {
  try {
    const fromLs = parseEnvelope<T>(localStorage.getItem(key))
    const fromCk = parseEnvelope<T>(readCookie(cookieName(key)))
    if (fromLs && fromCk) return (fromCk.t >= fromLs.t ? fromCk.d : fromLs.d) ?? fallback
    if (fromCk) return fromCk.d ?? fallback
    if (fromLs) return fromLs.d ?? fallback
  } catch {
    // Bỏ qua payload hỏng.
  }
  return fallback
}

export function writeShared<T>(key: string, value: T) {
  const envelope: Envelope<T> = { t: Date.now(), d: value }
  const raw = JSON.stringify(envelope)
  try {
    localStorage.setItem(key, raw)
  } catch {
    // localStorage đầy / ẩn danh.
  }
  if (raw.length <= COOKIE_MAX) {
    try {
      writeCookie(cookieName(key), raw)
    } catch {
      // Cookie bị chặn.
    }
  }
}

export function subscribeShared(key: string, onChange: () => void) {
  function onStorage(e: StorageEvent) {
    if (e.key === key) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', onChange)
  const timer = window.setInterval(onChange, 1500)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', onChange)
    window.clearInterval(timer)
  }
}

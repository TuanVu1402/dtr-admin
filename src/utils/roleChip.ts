const palette = [
  'bg-[rgba(159,176,201,0.14)] text-(--text-secondary) border-[rgba(159,176,201,0.35)]',
  'bg-[rgba(37,99,235,0.12)] text-(--gold-bright) border-[rgba(37,99,235,0.4)]',
  'bg-[rgba(76,175,130,0.14)] text-(--positive) border-[rgba(76,175,130,0.4)]',
  'bg-[rgba(184,134,11,0.14)] text-(--gold-bright) border-[rgba(184,134,11,0.4)]',
  'bg-[rgba(124,58,237,0.14)] text-(--gold-bright) border-[rgba(124,58,237,0.4)]',
  'bg-[rgba(217,122,108,0.14)] text-(--negative) border-[rgba(217,122,108,0.4)]',
]

const fixed: Record<string, string> = {
  user: palette[0],
  admin: palette[1],
  manager: palette[2],
  gdda: palette[3],
  dtlo: palette[4],
  support_admin: palette[5],
}

/**
 * Màu nhãn vai trò. Vai trò hệ thống giữ màu cũ; vai trò tự tạo được gán màu ổn định
 * theo mã nên không cần cập nhật bảng cứng mỗi lần thêm vai trò.
 */
export function roleChipClass(roleId: string): string {
  if (fixed[roleId]) return fixed[roleId]
  let hash = 0
  for (let i = 0; i < roleId.length; i += 1) hash = (hash * 31 + roleId.charCodeAt(i)) % palette.length
  return palette[hash]
}

import { useEffect, useState } from 'react'
import { adminUsers } from '../../data/adminData'
import { getInitials } from '../../utils/format'

const seedById = new Map(adminUsers.filter((u) => u.avatarUrl).map((u) => [u.id, u.avatarUrl!]))
const seedByName = new Map(
  adminUsers.filter((u) => u.avatarUrl).map((u) => [u.name.toLowerCase(), u.avatarUrl!]),
)

/** Ảnh mẫu luôn lấy từ bundle — không dùng URL hash cũ trong localStorage (máy tính hay giữ cache). */
export function resolveAvatarUrl(user: { id?: string; name: string; avatarUrl?: string }): string | undefined {
  if (user.avatarUrl?.startsWith('data:')) return user.avatarUrl
  return (user.id ? seedById.get(user.id) : undefined) ?? seedByName.get(user.name.toLowerCase()) ?? user.avatarUrl
}

type UserAvatarProps = {
  name: string
  id?: string
  avatarUrl?: string
  className?: string
}

export default function UserAvatar({ name, id, avatarUrl, className = 'h-full w-full object-cover' }: UserAvatarProps) {
  const src = resolveAvatarUrl({ id, name, avatarUrl })
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) return <>{getInitials(name)}</>

  return <img className={className} src={src} alt={name} onError={() => setFailed(true)} />
}

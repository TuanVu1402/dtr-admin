import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { roleLabels } from '../../types/dtr'
import { getInitials } from '../../utils/format'

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"

export default function ProfilePanel() {
  const { role, profile, updateProfile } = useAuth()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [saved, setSaved] = useState(false)

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(typeof reader.result === 'string' ? reader.result : undefined)
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    updateProfile({ name: trimmedName, email: email.trim(), avatarUrl })
    setSaved(true)
  }

  if (!role) return null

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 pb-14 max-[640px]:px-4 max-[640px]:pt-5">
      <div>
        <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold max-[640px]:text-[22px] tracking-[0.5px] text-(--text-primary)">
          Hồ sơ cá nhân
        </div>
        <p className="m-0 text-sm font-medium text-(--text-tertiary) max-[640px]:hidden">
          Thông tin tài khoản đang đăng nhập theo vai trò {roleLabels[role]}.
        </p>
      </div>

      <form
        className="flex max-w-[560px] flex-col gap-6 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-1) p-7 max-[640px]:p-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-4.5">
          <div
            className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--gold),var(--gold-deep))] bg-cover bg-center text-xl font-bold text-(--on-gold)"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {!avatarUrl && getInitials(name || '?')}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-avatar"
              className="inline-flex w-fit cursor-pointer items-center rounded-[10px] border border-[rgba(37,99,235,0.3)] bg-transparent px-4 py-2.5 text-[13px] font-bold text-(--text-secondary)"
            >
              Đổi ảnh đại diện
            </label>
            <input id="profile-avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {avatarUrl && (
              <button
                type="button"
                className="w-fit cursor-pointer border-none bg-none p-0 text-left text-[12.5px] font-bold text-(--negative)"
                onClick={() => {
                  setAvatarUrl(undefined)
                  setSaved(false)
                }}
              >
                Xóa ảnh, dùng chữ viết tắt
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="profile-name">
            Họ tên
          </label>
          <input
            id="profile-name"
            className={fieldInputClass}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass} htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            className={fieldInputClass}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setSaved(false)
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabelClass}>Vai trò</label>
          <div className="w-fit rounded-full border border-[rgba(37,99,235,0.3)] bg-[rgba(37,99,235,0.08)] px-4 py-2 text-[13px] font-bold text-(--gold-bright)">
            {roleLabels[role]}
          </div>
          <p className="m-0 text-[12px] text-(--text-tertiary)">
            Vai trò do quản trị hệ thống gán, không tự đổi được ở đây.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={btnPrimaryClass}>
            Lưu thay đổi
          </button>
          {saved && <span className="text-[13px] font-bold text-(--positive)">Đã lưu.</span>}
        </div>
      </form>
    </section>
  )
}

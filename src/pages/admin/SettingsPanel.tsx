import { useEffect, useState, type FormEvent } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { DEFAULT_DEMO_PASSWORD } from '../../utils/roles'
import { MoonIcon, SunIcon } from '../../components/ui/icons'

type NotificationPrefs = {
  emailNewSubmission: boolean
  emailFeedback: boolean
  browserPush: boolean
}

const PREFS_KEY = 'dtr-admin-notification-prefs'
const defaultPrefs: NotificationPrefs = {
  emailNewSubmission: true,
  emailFeedback: true,
  browserPush: false,
}

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? { ...defaultPrefs, ...(JSON.parse(raw) as Partial<NotificationPrefs>) } : defaultPrefs
  } catch {
    return defaultPrefs
  }
}

const cardClass = 'flex flex-col gap-5 rounded-2xl border border-[rgba(37,99,235,0.2)] bg-(--surface-1) p-7'
const sectionTitleClass = "font-['Open_Sans',sans-serif] text-lg font-extrabold text-(--text-primary)"
const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'
const btnPrimaryClass =
  "min-h-11 cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[11px] font-['Open_Sans',sans-serif] text-[13.5px] font-bold text-(--on-gold)"

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-[13.5px] font-bold text-(--text-primary)">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] text-(--text-tertiary)">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ${
          checked ? 'bg-(--gold)' : 'bg-[rgba(159,176,201,0.35)]'
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
          }`}
        />
      </span>
    </label>
  )
}

export default function SettingsPanel() {
  const { theme, toggleTheme } = useTheme()
  const { profile, updateProfile } = useAuth()
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      // localStorage không khả dụng — bỏ qua, giữ tùy chọn trong bộ nhớ tạm.
    }
  }, [prefs])

  function updatePref(key: keyof NotificationPrefs, value: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordSaved(false)
    if (currentPassword !== (profile.password || DEFAULT_DEMO_PASSWORD)) {
      setPasswordError('Mật khẩu hiện tại không đúng.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới cần ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu không khớp.')
      return
    }
    setPasswordError(null)
    updateProfile({ password: newPassword })
    setPasswordSaved(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <section className="flex flex-col gap-4.5 px-11 pt-8 pb-14 max-[640px]:px-5">
      <div>
        <div className="m-0 font-['Open_Sans',sans-serif] text-[30px] font-extrabold tracking-[0.5px] text-(--text-primary)">
          Cài đặt
        </div>
        <p className="m-0 text-sm font-medium text-(--text-tertiary)">
          Tùy chỉnh giao diện, thông báo và bảo mật cho tài khoản admin.
        </p>
      </div>

      <div className="grid max-w-[720px] grid-cols-1 gap-5">
        <div className={cardClass}>
          <div className={sectionTitleClass}>Giao diện</div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13.5px] font-bold text-(--text-primary)">Chế độ hiển thị</div>
              <div className="mt-0.5 text-[12px] text-(--text-tertiary)">
                Hiện đang dùng giao diện {theme === 'dark' ? 'tối' : 'sáng'}.
              </div>
            </div>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(37,99,235,0.3)] bg-transparent px-4 py-2.5 text-[13px] font-bold text-(--gold-bright)"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              Chuyển sang {theme === 'dark' ? 'sáng' : 'tối'}
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <div className={sectionTitleClass}>Thông báo</div>
          <Toggle
            checked={prefs.emailNewSubmission}
            onChange={(v) => updatePref('emailNewSubmission', v)}
            label="Email khi có minh chứng mới chờ duyệt"
            hint="Demo: bật/tắt được lưu trên máy. Chuông trên header gắn với duyệt điểm và QR."
          />
          <Toggle
            checked={prefs.emailFeedback}
            onChange={(v) => updatePref('emailFeedback', v)}
            label="Email khi có phản hồi / báo lỗi mới"
          />
          <Toggle
            checked={prefs.browserPush}
            onChange={(v) => updatePref('browserPush', v)}
            label="Thông báo đẩy trên trình duyệt"
            hint="Chỉ hoạt động khi đang mở trang quản trị."
          />
        </div>

        <form className={cardClass} onSubmit={handleChangePassword}>
          <div className={sectionTitleClass}>Bảo mật</div>
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass} htmlFor="settings-current-password">
              Mật khẩu hiện tại
            </label>
            <input
              id="settings-current-password"
              className={fieldInputClass}
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value)
                setPasswordSaved(false)
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
            <div className="flex flex-col gap-2">
              <label className={fieldLabelClass} htmlFor="settings-new-password">
                Mật khẩu mới
              </label>
              <input
                id="settings-new-password"
                className={fieldInputClass}
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setPasswordSaved(false)
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={fieldLabelClass} htmlFor="settings-confirm-password">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="settings-confirm-password"
                className={fieldInputClass}
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setPasswordSaved(false)
                }}
              />
            </div>
          </div>
          {passwordError && <div className="text-[13px] font-semibold text-(--negative)">{passwordError}</div>}
          <div className="flex items-center gap-3">
            <button type="submit" className={btnPrimaryClass}>
              Đổi mật khẩu
            </button>
            {passwordSaved && <span className="text-[13px] font-bold text-(--positive)">Đã cập nhật mật khẩu.</span>}
          </div>
        </form>

        <div className={cardClass}>
          <div className={sectionTitleClass}>Thông tin hệ thống</div>
          <div className="grid grid-cols-2 gap-3.5 max-[420px]:grid-cols-1">
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Phiên bản</div>
              <div className="text-[13.5px] font-bold text-(--text-primary)">DTR Admin Console — bản demo</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold tracking-[0.6px] text-(--text-muted) uppercase">Lưu trữ dữ liệu</div>
              <div className="text-[13.5px] font-bold text-(--text-primary)">Cục bộ trên trình duyệt (localStorage)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

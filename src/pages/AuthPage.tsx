import { useState, type FormEvent } from 'react'
import { BriefcaseIcon, ClipIcon, CrownIcon, MoonIcon, ShieldIcon, SunIcon } from '../components/ui/icons'
import BrandLogo from '../components/ui/BrandLogo'
import { useTheme } from '../context/ThemeContext'
import { roleLabels, type Role } from '../types/dtr'

type AuthTab = 'login' | 'forgot'

type AuthPageProps = {
  onAuthenticated: (role: Role) => void
}

const quickRoles: { role: Role; icon: typeof ShieldIcon }[] = [
  { role: 'manager', icon: BriefcaseIcon },
  { role: 'admin', icon: ShieldIcon },
  { role: 'gdda', icon: ClipIcon },
  { role: 'dtlo', icon: ClipIcon },
  { role: 'support_admin', icon: CrownIcon },
]

const fieldInputClass =
  "w-full rounded-[10px] border border-[rgba(37,99,235,0.25)] bg-(--surface-tint) px-3.5 py-[11px] font-['Open_Sans',sans-serif] text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--gold) focus:outline-none"
const fieldLabelClass = 'text-[12.5px] font-bold text-(--text-secondary)'
const authSubmitClass =
  "min-h-[46px] cursor-pointer rounded-[10px] border-none bg-[linear-gradient(90deg,var(--gold-deep),var(--gold))] px-5 py-[13px] font-['Open_Sans',sans-serif] text-sm font-bold text-(--on-gold)"
const authLinkBtnClass = 'cursor-pointer border-none bg-none p-0 font-inherit font-bold text-(--gold-bright)'
const authSwitchClass = 'm-0 text-center text-[13.5px] text-(--text-tertiary)'

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { theme, toggleTheme } = useTheme()

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    onAuthenticated('manager')
  }

  function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    // Demo — chưa nối email thật, chỉ mô phỏng đã gửi liên kết đặt lại mật khẩu.
    setResetSent(true)
  }

  function backToLogin() {
    setTab('login')
    setResetSent(false)
    setResetEmail('')
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-[radial-gradient(1100px_480px_at_85%_-10%,var(--bg-glow),transparent_60%),linear-gradient(180deg,var(--bg-1)_0%,var(--bg-2)_40%,var(--bg-3)_100%)] px-5 py-10 text-(--text-primary)">
      <button
        type="button"
        className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(37,99,235,0.22)] bg-[rgba(37,99,235,0.08)] text-(--gold)"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-1.5">
          <BrandLogo height={56} />
          <div className="text-[11px] font-semibold tracking-[3px] text-(--text-tertiary)"></div>
        </div>

        <div className="flex w-full flex-col gap-5.5 rounded-[20px] border border-[rgba(37,99,235,0.28)] bg-(--surface-1) p-8 shadow-[0_30px_60px_var(--shadow)] dark:bg-[linear-gradient(160deg,color-mix(in_srgb,var(--surface-1)_60%,transparent),color-mix(in_srgb,var(--surface-2)_60%,transparent))]">
          {tab === 'forgot' ? (
            <div className="flex flex-col gap-2">
              <h1 className="m-0 font-['Open_Sans',sans-serif] text-[22px] font-extrabold text-(--text-primary)">
                Quên mật khẩu
              </h1>
              <p className="m-0 text-[13.5px] leading-[1.55] text-(--text-tertiary)">
                Nhập email đã đăng ký, mình sẽ gửi liên kết đặt lại mật khẩu cho bạn.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <h1 className="m-0 font-['Open_Sans',sans-serif] text-[22px] font-extrabold text-(--text-primary)">
                Chào mừng bạn quay lại
              </h1>
              <p className="m-0 text-[13.5px] leading-[1.55] text-(--text-tertiary)">
                Đăng nhập vào DTR Point Admin để chấm điểm, quản lý người dùng và xem phản hồi.
              </p>
            </div>
          )}

          {tab === 'login' ? (
            <>
              <div className="grid grid-cols-2 gap-2.5 max-[480px]:grid-cols-1">
                {quickRoles.map(({ role, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[rgba(37,99,235,0.28)] bg-(--surface-tint) px-3 py-[11px] text-left font-['Open_Sans',sans-serif] text-[12.5px] font-bold text-(--text-primary) hover:border-(--gold) hover:bg-[rgba(37,99,235,0.12)]"
                    onClick={() => onAuthenticated(role)}
                  >
                    <Icon size={18} />
                    Vào với tài khoản {roleLabels[role]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold tracking-[1px] text-(--text-muted) before:h-px before:flex-1 before:bg-[rgba(37,99,235,0.18)] before:content-[''] after:h-px after:flex-1 after:bg-[rgba(37,99,235,0.18)] after:content-['']">
                <span>HOẶC ĐĂNG NHẬP THỦ CÔNG</span>
              </div>

              <form className="flex flex-col gap-4.5" onSubmit={handleLogin}>
                <div className="flex flex-col gap-2">
                  <label className={fieldLabelClass} htmlFor="login-email">
                    Email
                  </label>
                  <input id="login-email" className={fieldInputClass} type="email" placeholder="ban@dtr.vn" required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={fieldLabelClass} htmlFor="login-password">
                    Mật khẩu
                  </label>
                  <input
                    id="login-password"
                    className={fieldInputClass}
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="-mt-1.5 flex flex-wrap items-center justify-between gap-2.5">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-(--text-secondary)">
                    <input type="checkbox" className="accent-(--gold)" />
                    Ghi nhớ đăng nhập
                  </label>
                  <button type="button" className={authLinkBtnClass} onClick={() => setTab('forgot')}>
                    Quên mật khẩu?
                  </button>
                </div>

                <button type="submit" className={authSubmitClass}>
                  Đăng nhập
                </button>
              </form>
            </>
          ) : resetSent ? (
            <div className="flex flex-col gap-4.5">
              <p className="m-0 text-[13.5px] leading-[1.55] text-(--text-tertiary)">
                Đã gửi liên kết đặt lại mật khẩu tới <b className="text-(--gold-bright)">{resetEmail}</b> (giả lập —
                chưa nối email thật). Kiểm tra hộp thư để tiếp tục.
              </p>
              <button type="button" className={authSubmitClass} onClick={backToLogin}>
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4.5" onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-2">
                <label className={fieldLabelClass} htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  className={fieldInputClass}
                  type="email"
                  placeholder="ban@dtr.vn"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={authSubmitClass}>
                Gửi liên kết đặt lại mật khẩu
              </button>

              <p className={authSwitchClass}>
                Nhớ ra mật khẩu rồi?{' '}
                <button type="button" className={authLinkBtnClass} onClick={backToLogin}>
                  Quay lại đăng nhập
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="text-center text-xs text-(--text-muted)">© 2026 DTR — Your Time Has Come</div>
      </div>
    </div>
  )
}

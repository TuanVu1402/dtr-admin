import { useState, type FormEvent } from 'react'
import { BriefcaseIcon, CrownIcon, MoonIcon, ShieldIcon, SunIcon } from '../components/icons'
import BrandLogo from '../components/BrandLogo'
import { useTheme } from '../context/ThemeContext'
import { roleLabels, type Role } from '../types/dtr'
import '../styles/shared.css'
import './AuthPage.css'

type AuthTab = 'login' | 'register' | 'forgot'

type AuthPageProps = {
  onAuthenticated: (role: Role) => void
}

const quickRoles: { role: Role; icon: typeof ShieldIcon }[] = [
  { role: 'manager', icon: BriefcaseIcon },
  { role: 'admin', icon: ShieldIcon },
  { role: 'support_admin', icon: CrownIcon },
]

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const { theme, toggleTheme } = useTheme()

  function handleLogin(e: FormEvent) {
    e.preventDefault()
    onAuthenticated('manager')
  }

  function handleRegister(e: FormEvent) {
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
    <div className="auth-root page-bg">
      <button
        type="button"
        className="icon-btn auth-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
      <div className="auth-shell">
        <div className="auth-brand">
          <BrandLogo height={56} />
          <div className="auth-tagline">YOUR TIME HAS COME</div>
        </div>

        <div className="auth-card">
          {tab === 'forgot' ? (
            <div className="auth-card-head">
              <h1 className="auth-title">Quên mật khẩu</h1>
              <p className="auth-subtitle">
                Nhập email đã đăng ký, mình sẽ gửi liên kết đặt lại mật khẩu cho bạn.
              </p>
            </div>
          ) : (
            <div className="auth-card-head">
              <h1 className="auth-title">Chào mừng bạn quay lại</h1>
              <p className="auth-subtitle">
                Đăng nhập vào DTR Point Admin để chấm điểm, quản lý người dùng và xem phản hồi.
              </p>
            </div>
          )}

          {tab !== 'forgot' && (
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                onClick={() => setTab('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                onClick={() => setTab('register')}
              >
                Đăng ký
              </button>
            </div>
          )}

          {tab === 'login' ? (
            <>
              <div className="quick-role-grid">
                {quickRoles.map(({ role, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    className="quick-role-btn"
                    onClick={() => onAuthenticated(role)}
                  >
                    <Icon size={18} />
                    Vào với tài khoản {roleLabels[role]}
                  </button>
                ))}
              </div>

              <div className="auth-divider">
                <span>HOẶC ĐĂNG NHẬP THỦ CÔNG</span>
              </div>

              <form className="auth-form" onSubmit={handleLogin}>
                <div className="field">
                  <label className="field-label" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    id="login-email"
                    className="field-input"
                    type="email"
                    placeholder="ban@dtr.vn"
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="login-password">
                    Mật khẩu
                  </label>
                  <input
                    id="login-password"
                    className="field-input"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="auth-row">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    Ghi nhớ đăng nhập
                  </label>
                  <button type="button" className="auth-link-btn" onClick={() => setTab('forgot')}>
                    Quên mật khẩu?
                  </button>
                </div>

                <button type="submit" className="auth-submit">
                  Đăng nhập
                </button>

                <p className="auth-switch">
                  Chưa có tài khoản?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => setTab('register')}>
                    Đăng ký ngay
                  </button>
                </p>
              </form>
            </>
          ) : tab === 'register' ? (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="field">
                <label className="field-label" htmlFor="register-name">
                  Họ và tên
                </label>
                <input
                  id="register-name"
                  className="field-input"
                  type="text"
                  placeholder="Nguyễn An"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="register-email">
                  Email
                </label>
                <input
                  id="register-email"
                  className="field-input"
                  type="email"
                  placeholder="ban@dtr.vn"
                  required
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="register-phone">
                  Số điện thoại
                </label>
                <input
                  id="register-phone"
                  className="field-input"
                  type="tel"
                  placeholder="09xx xxx xxx"
                  required
                />
              </div>

              <div className="auth-form-grid">
                <div className="field">
                  <label className="field-label" htmlFor="register-password">
                    Mật khẩu
                  </label>
                  <input
                    id="register-password"
                    className="field-input"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="register-password-confirm">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="register-password-confirm"
                    className="field-input"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit">
                Tạo tài khoản
              </button>

              <p className="auth-switch">
                Đã có tài khoản?{' '}
                <button type="button" className="auth-link-btn" onClick={() => setTab('login')}>
                  Đăng nhập
                </button>
              </p>
            </form>
          ) : resetSent ? (
            <div className="auth-reset-done">
              <p className="auth-subtitle">
                Đã gửi liên kết đặt lại mật khẩu tới <b className="gold-text">{resetEmail}</b> (giả lập
                — chưa nối email thật). Kiểm tra hộp thư để tiếp tục.
              </p>
              <button type="button" className="auth-submit" onClick={backToLogin}>
                Quay lại đăng nhập
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="field">
                <label className="field-label" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  className="field-input"
                  type="email"
                  placeholder="ban@dtr.vn"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="auth-submit">
                Gửi liên kết đặt lại mật khẩu
              </button>

              <p className="auth-switch">
                Nhớ ra mật khẩu rồi?{' '}
                <button type="button" className="auth-link-btn" onClick={backToLogin}>
                  Quay lại đăng nhập
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="auth-footer">© 2026 DTR — Your Time Has Come</div>
      </div>
    </div>
  )
}

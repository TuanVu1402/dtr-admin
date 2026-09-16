import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MoonIcon, SunIcon } from '../../components/icons'
import NotificationsMenu from '../../components/NotificationsMenu'
import UserMenu from '../../components/UserMenu'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const tabs = [
  { to: 'manager', label: 'Manager' },
  { to: 'users', label: 'Admin' },
  { to: 'support', label: 'Support Admin' },
  { to: 'feedback', label: 'Phản hồi' },
  { to: 'reports', label: 'Thống kê' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(1100px_480px_at_85%_-10%,var(--bg-glow),transparent_60%),linear-gradient(180deg,var(--bg-1)_0%,var(--bg-2)_40%,var(--bg-3)_100%)] pb-14 text-(--text-primary)">
      <header className="flex items-center justify-between gap-6 border-b border-[rgba(37,99,235,0.16)] px-11 py-5.5 max-[640px]:px-5">
        <div className="flex items-center gap-4.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold tracking-[2.5px] text-(--text-tertiary)">ADMIN</span>
            <span className="text-[10px] font-semibold tracking-[2.5px] text-(--text-tertiary)">CONSOLE</span>
          </div>
        </div>

        <div className="flex items-center gap-5.5">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(37,99,235,0.22)] bg-[rgba(37,99,235,0.08)] text-(--gold)"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <NotificationsMenu />
          <UserMenu name="Đỗ Thanh Hằng" initials="HA" onLogout={handleLogout} />
        </div>
      </header>

      <section className="flex flex-col gap-3.5 px-11 pt-9 max-[640px]:px-5">
        <div className="text-xs font-bold tracking-[1.4px] text-(--text-tertiary) uppercase">Xem theo vai trò</div>
        <div className="flex flex-wrap gap-2.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `cursor-pointer rounded-full border px-5 py-2.5 font-['Open_Sans',sans-serif] text-[13.5px] font-bold no-underline ${
                  isActive
                    ? 'border-(--gold) bg-(--gold) text-(--on-gold)'
                    : 'border-[rgba(37,99,235,0.25)] bg-transparent text-(--text-secondary)'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <p className="mt-1 max-w-[780px] text-[13px] leading-[1.6] text-(--text-tertiary)">
          <b className="text-(--gold-bright)">Manager</b> duyệt / từ chối minh chứng để chấm điểm DTR.{' '}
          <b className="text-(--gold-bright)">Admin</b> quản lý danh sách người dùng &amp; tạo mã QR điểm danh.{' '}
          <b className="text-(--gold-bright)">Support Admin</b> toàn quyền — thấy được cả 2 mục trên.{' '}
          <b className="text-(--gold-bright)">Phản hồi</b> xem báo lỗi / góp ý người dùng gửi từ Trang chủ User.{' '}
          <b className="text-(--gold-bright)">Thống kê</b> tổng quan số liệu và xuất báo cáo Excel/PDF.
        </p>
      </section>

      <Outlet />
    </div>
  )
}

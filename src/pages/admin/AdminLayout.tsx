import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MoonIcon, SunIcon } from '../../components/icons'
import BrandLogo from '../../components/BrandLogo'
import NotificationsMenu from '../../components/NotificationsMenu'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import '../../styles/shared.css'
import './admin.css'

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
    <div className="admin-root page-bg">
      <header className="navbar">
        <div className="brand">
          <BrandLogo />
          <div className="brand-divider" />
          <div className="brand-sub">
            <span className="brand-sub-line">ADMIN</span>
            <span className="brand-sub-line">CONSOLE</span>
          </div>
        </div>

        <div className="nav-right">
          <button
            className="icon-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <NotificationsMenu />
          <div className="user-chip">
            <div className="avatar">HA</div>
            <div className="user-chip-info">
              <div className="user-name">Đỗ Thanh Hằng</div>
              <button type="button" className="logout-link" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="role-section">
        <div className="role-label">Xem theo vai trò</div>
        <div className="role-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `role-tab${isActive ? ' active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <p className="role-note">
          <b>Manager</b> duyệt / từ chối minh chứng để chấm điểm DTR. <b>Admin</b> quản lý danh sách
          người dùng &amp; tạo mã QR điểm danh. <b>Support Admin</b> toàn quyền — thấy được cả 2 mục
          trên. <b>Phản hồi</b> xem báo lỗi / góp ý người dùng gửi từ Trang chủ User. <b>Thống kê</b>{' '}
          tổng quan số liệu và xuất báo cáo Excel/PDF.
        </p>
      </section>

      <Outlet />
    </div>
  )
}

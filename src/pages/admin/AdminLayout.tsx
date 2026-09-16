import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MoonIcon, SunIcon } from '../../components/ui/icons'
import BrandLogo from '../../components/ui/BrandLogo'
import NotificationsMenu from '../../components/layout/NotificationsMenu'
import UserMenu from '../../components/layout/UserMenu'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../utils/format'
import { appTabs } from '../../utils/roles'

export default function AdminLayout() {
  const { logout, profile, role } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const visibleTabs = appTabs.filter((tab) => role && tab.roles.includes(role))

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(1100px_480px_at_85%_-10%,var(--bg-glow),transparent_60%),linear-gradient(180deg,var(--bg-1)_0%,var(--bg-2)_40%,var(--bg-3)_100%)] pb-14 text-(--text-primary)">
      <header className="flex items-center justify-between gap-3 border-b border-[rgba(37,99,235,0.16)] px-11 py-5.5 max-[640px]:px-4 max-[640px]:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo height={28} />
          <div className="flex flex-col gap-0.5 max-[640px]:hidden">
            <span className="text-[10px] font-semibold tracking-[2.5px] text-(--text-tertiary)">ADMIN</span>
            <span className="text-[10px] font-semibold tracking-[2.5px] text-(--text-tertiary)">CONSOLE</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5.5 max-[640px]:gap-2">
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
          <UserMenu name={profile.name} initials={getInitials(profile.name)} onLogout={handleLogout} />
        </div>
      </header>

      <section className="flex flex-col gap-3.5 px-11 pt-9 max-[640px]:px-4 max-[640px]:pt-5">
        <div className="text-xs font-bold tracking-[1.4px] text-(--text-tertiary) uppercase max-[640px]:hidden">
          Menu theo quyền
        </div>
        <div className="flex flex-wrap gap-2.5 max-[640px]:gap-2">
          {visibleTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `cursor-pointer rounded-full border px-5 py-2.5 font-['Open_Sans',sans-serif] text-[13.5px] font-bold no-underline max-[640px]:px-3.5 max-[640px]:py-2 max-[640px]:text-[12.5px] ${
                  isActive
                    ? 'border-(--gold) bg-(--gold) text-white'
                    : 'border-[rgba(37,99,235,0.25)] bg-transparent text-(--text-secondary)'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <p className="mt-1 max-w-[780px] text-[13px] leading-[1.6] text-(--text-tertiary) max-[640px]:hidden">
          Đăng nhập với vai trò nào thì chỉ thấy mục của vai trò đó.{' '}
          <b className="text-(--gold-bright)">Manager</b> chấm điểm.{' '}
          <b className="text-(--gold-bright)">Admin</b> quản lý user, QR, hạng mục.{' '}
          <b className="text-(--gold-bright)">Support Admin</b> thấy toàn bộ menu.
        </p>
      </section>

      <Outlet />
    </div>
  )
}

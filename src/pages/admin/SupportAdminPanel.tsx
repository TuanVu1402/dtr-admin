import AdminUsersPanel from './AdminUsersPanel'
import ManagerPanel from './ManagerPanel'

export default function SupportAdminPanel() {
  return (
    <>
      <section className="px-11 pt-8 pb-0 max-[640px]:px-5">
        <div className="rounded-2xl border border-[rgba(217,122,108,0.3)] bg-[rgba(217,122,108,0.08)] px-5 py-4 text-[13.5px] leading-[1.6] text-(--text-secondary)">
          <b className="text-(--negative)">Support Admin</b> có toàn quyền — xem được cả mục quản lý người dùng của
          Admin và mục chấm điểm của Manager bên dưới.
        </div>
      </section>

      <AdminUsersPanel />
      <ManagerPanel />
    </>
  )
}

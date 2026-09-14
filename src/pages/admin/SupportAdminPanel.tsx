import AdminUsersPanel from './AdminUsersPanel'
import ManagerPanel from './ManagerPanel'
import './admin.css'

export default function SupportAdminPanel() {
  return (
    <>
      <section className="content-section" style={{ paddingBottom: 0 }}>
        <div className="sup-admin-banner">
          <b>Support Admin</b> có toàn quyền — xem được cả mục quản lý người dùng của Admin và mục
          chấm điểm của Manager bên dưới.
        </div>
      </section>

      <AdminUsersPanel />
      <ManagerPanel />
    </>
  )
}

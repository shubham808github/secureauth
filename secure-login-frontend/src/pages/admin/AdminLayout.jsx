import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getUser, logoutUser } from "../../services/AuthService";
import "./admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <i className="bi bi-shield-lock-fill"></i> SecureAuth
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <i className="bi bi-speedometer2"></i> Overview
          </NavLink>
          <NavLink to="/admin/users">
            <i className="bi bi-people"></i> Users
          </NavLink>
          <NavLink to="/profile">
            <i className="bi bi-person-circle"></i> My Profile
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="mb-2">
            <div className="fw-semibold">{user?.username}</div>
            <span className="badge bg-light text-dark">{user?.role}</span>
          </div>
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/AuthService";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboard = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to={dashboard}>
        <i className="bi bi-shield-lock-fill me-2"></i>SecureAuth
      </Link>
      <div className="ms-auto d-flex align-items-center gap-3">
        <Link className="text-light text-decoration-none" to={dashboard}>Dashboard</Link>
        <Link className="text-light text-decoration-none" to="/profile">Profile</Link>
        <span className="badge bg-secondary">{user?.role}</span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
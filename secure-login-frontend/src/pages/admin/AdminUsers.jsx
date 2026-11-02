import { useEffect, useState } from "react";
import {
  getUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../../services/AuthService";

function AdminUsers() {
  const currentUser = getUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const showMessage = (msg, isError = false) => {
    setError(isError ? msg : "");
    setSuccess(isError ? "" : msg);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleRoleChange = async (user, role) => {
    try {
      const updated = await updateUserRole(user.userId, role);
      setUsers((prev) => prev.map((u) => (u.userId === updated.userId ? updated : u)));
      showMessage(`${updated.username} is now ${updated.role}`);
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not update role", true);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.username}? This cannot be undone.`)) return;
    try {
      await deleteUser(user.userId);
      setUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      showMessage(`${user.username} deleted`);
    } catch (err) {
      showMessage(err.response?.data?.message || "Could not delete user", true);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="admin-title">Users</h3>
          <p className="text-muted mb-0">{users.length} registered users</p>
        </div>
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            className="form-control"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="card stat-card p-0">
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 users-table">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th style={{ width: 160 }}>Role</th>
                  <th className="pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSelf = u.userId === currentUser?.userId;
                  return (
                    <tr key={u.userId}>
                      <td className="ps-4">{u.userId}</td>
                      <td className="cell-truncate" title={u.username}>
                        {u.username}
                        {isSelf && <span className="badge bg-info ms-2">You</span>}
                      </td>
                      <td className="cell-truncate" title={u.email}>{u.email}</td>
                      <td>
                        <select
                          className="form-select form-select-sm role-select"
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="pe-4">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={isSelf}
                          onClick={() => handleDelete(u)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminUsers;
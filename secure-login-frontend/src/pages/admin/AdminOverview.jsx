import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats, getAllUsers, getUser } from "../../services/AuthService";

const shortName = (name = "") => name.split("@")[0];
const initials = (name = "") => shortName(name).slice(0, 2).toUpperCase() || "?";
const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

function AdminOverview() {
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()])
      .then(([s, list]) => {
        setStats(s);
        setUsers(list);
        requestAnimationFrame(() => setAnimate(true));
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Could not load dashboard data. Check that the backend is running.")
      );
  }, []);

  const total = stats?.totalUsers ?? 0;
  const admins = stats?.adminCount ?? 0;
  const standard = stats?.userCount ?? 0;
  const adminShare = pct(admins, total);

  const newest = [...users].sort((a, b) => b.userId - a.userId).slice(0, 5);

  const note =
    total >= 4 && adminShare > 25
      ? `Administrators are ${adminShare}% of all accounts. Check that each one needs admin access.`
      : `Admin access is limited to ${admins} of ${total} accounts.`;

  return (
    <>
      <header className="ov-head">
        <div>
          <h3 className="admin-title">Access overview</h3>
          <p className="ov-sub">Signed in as {shortName(user?.username)}</p>
        </div>
        <Link to="/admin/users" className="btn btn-dark ov-cta">
          <i className="bi bi-people me-2"></i>Manage users
        </Link>
      </header>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="ov-grid">
        <div className="ov-col">
          <section className="ov-card">
            <h5 className="ov-card-title">Who has access</h5>

            <div className="ov-strip">
              <div>
                <div className="ov-num">{stats ? total : "–"}</div>
                <div className="ov-label">Total accounts</div>
              </div>
              <div>
                <div className="ov-num">{stats ? admins : "–"}</div>
                <div className="ov-label">Administrators</div>
              </div>
              <div>
                <div className="ov-num">{stats ? standard : "–"}</div>
                <div className="ov-label">Standard users</div>
              </div>
            </div>

            <div
              className="ov-bar"
              role="img"
              aria-label={`${admins} administrators and ${standard} standard users`}
            >
              <span className="ov-seg ov-seg-admin" style={{ width: animate ? `${adminShare}%` : "0%" }} />
              <span className="ov-seg ov-seg-user" />
            </div>

            <div className="ov-legend">
              <span><i className="dot dot-admin"></i>Administrators {stats && `${adminShare}%`}</span>
              <span><i className="dot dot-user"></i>Standard users {stats && `${100 - adminShare}%`}</span>
            </div>

            {stats && <p className="ov-note">{note}</p>}
          </section>

          <section className="ov-card">
            <div className="ov-card-row">
              <h5 className="ov-card-title mb-0">Newest accounts</h5>
              <Link to="/admin/users" className="ov-link">View all</Link>
            </div>

            <div className="table-responsive">
              <table className="table ov-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {newest.map((u) => (
                    <tr key={u.userId}>
                      <td>
                        <div className="ov-person">
                          <span className="ov-avatar">{initials(u.username)}</span>
                          <div className="ov-person-text">
                            <div className="ov-person-name">{shortName(u.username)}</div>
                            <div className="ov-person-mail">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${u.role === "ADMIN" ? "pill-admin" : "pill-user"}`}>
                          {u.role === "ADMIN" ? "Admin" : "User"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {newest.length === 0 && (
                    <tr>
                      <td colSpan="2" className="text-muted py-4">
                        No accounts yet. New registrations will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="ov-col">
          <section className="ov-card">
            <h5 className="ov-card-title">Your session</h5>
            <dl className="ov-dl">
              <div>
                <dt>Account</dt>
                <dd>{user?.email || user?.username}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd><span className="pill pill-admin">{user?.role}</span></dd>
              </div>
            </dl>
            <p className="ov-label mb-2">You can</p>
            <ul className="ov-can">
              <li><i className="bi bi-check2"></i>View every account</li>
              <li><i className="bi bi-check2"></i>Change a user's role</li>
              <li><i className="bi bi-check2"></i>Delete accounts</li>
            </ul>
            <p className="ov-fine">You can't change or delete your own account.</p>
          </section>
        </aside>
      </div>
    </>
  );
}

export default AdminOverview;

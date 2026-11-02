import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getProfile, getUser, changePassword } from "../services/AuthService";

function Profile() {
  const [profile, setProfile] = useState(getUser());
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((err) => console.error("profile error:", err.response?.data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.next !== form.confirm) {
      setError("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(form.current, form.next);
      setSuccess(res.message || "Password updated");
      setTimeout(() => setSuccess(""), 4000);   // hide success message after 4 seconds
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update password");
      setTimeout(() => setError(""), 4000);     // hide error message after 4 seconds
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: 600 }}>
        <div className="card shadow-sm p-4 mb-4">
          <h3 className="mb-3">My Profile</h3>
          <p><strong>Username:</strong> {profile?.username}</p>
          <p><strong>Email:</strong> {profile?.email}</p>
          <p className="mb-0"><strong>Role:</strong> {profile?.role}</p>
        </div>

        <div className="card shadow-sm p-4">
          <h4 className="mb-3">Change Password</h4>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {success && <div className="alert alert-success py-2">{success}</div>}

          <form onSubmit={handleSubmit}>
            <label className="form-label">Current password</label>
            <input type="password" name="current" className="form-control mb-3"
                   value={form.current} onChange={handleChange} required />

            <label className="form-label">New password</label>
            <input type="password" name="next" className="form-control mb-3"
                   value={form.next} onChange={handleChange} minLength={6} required />

            <label className="form-label">Confirm new password</label>
            <input type="password" name="confirm" className="form-control mb-4"
                   value={form.confirm} onChange={handleChange} minLength={6} required />

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Profile;
import Navbar from "../components/Navbar";
import { getUser } from "../services/AuthService";

function UserDashboard() {
  const user = getUser();
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <div className="card shadow-sm p-4">
          <h3>Welcome, {user?.username}!</h3>
          <p className="text-muted mb-0">You are signed in as a standard user.</p>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
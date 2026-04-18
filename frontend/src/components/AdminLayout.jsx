import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? styles.activeLink : styles.link;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: "30px" }}>CineBook Admin</h2>

        <p style={isActive("/admin")} onClick={() => navigate("/admin")}>
          Dashboard
        </p>

        <p style={isActive("/admin/movies")} onClick={() => navigate("/admin/movies")}>
          Manage Movies
        </p>

        <p style={isActive("/admin/users")} onClick={() => navigate("/admin/users")}>
          Manage Users
        </p>

        <p style={isActive("/admin/bookings")} onClick={() => navigate("/admin/bookings")}>
          Manage Bookings
        </p>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "250px",
    background: "#111827",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    cursor: "pointer",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  activeLink: {
    cursor: "pointer",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "10px",
    backgroundColor: "#2563eb",
  },
  logoutBtn: {
    marginTop: "auto",
    padding: "10px",
    backgroundColor: "#f43f5e",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: "40px",
  },
};

export default AdminLayout;
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (!auth?.token) return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "https://cinebook-xypk.onrender.com/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [auth?.token]);

  const toggleSubscription = async (id) => {
    try {
      await axios.put(
        `https://cinebook-xypk.onrender.com/api/admin/users/${id}/subscription`,
        {},
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      // Refresh list
      setUsers(users.map(u => {
        if (u._id === id) return { ...u, subscription: u.subscription === "premium" ? "none" : "premium" };
        return u;
      }));
    } catch (error) {
      console.error("Error toggling subscription", error);
    }
  };

  return (
    <AdminLayout>
      <h1>Manage Users</h1>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Subscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={styles.row}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span
                  style={
                    user.role === "admin"
                      ? styles.adminBadge
                      : styles.userBadge
                  }
                >
                  {user.role}
                </span>
              </td>
              <td>
                <span style={user.subscription === "premium" ? styles.premiumBadge : styles.userBadge}>
                  {user.subscription || "none"}
                </span>
              </td>
              <td>
                <button
                  style={styles.toggleBtn}
                  onClick={() => toggleSubscription(user._id)}
                >
                  Toggle Premium
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

const styles = {
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "10px",
    overflow: "hidden",
  },
  headerRow: {
    backgroundColor: "#2563eb",
    color: "white",
  },
  row: {
    borderBottom: "1px solid #ddd",
  },
  adminBadge: {
    backgroundColor: "#f43f5e",
    padding: "4px 10px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
  },
  userBadge: {
    backgroundColor: "#10b981",
    padding: "4px 10px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
  },
  premiumBadge: {
    backgroundColor: "#f59e0b",
    padding: "4px 10px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    textTransform: "capitalize",
  },
  toggleBtn: {
    padding: "6px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  }
};

export default AdminUsers;
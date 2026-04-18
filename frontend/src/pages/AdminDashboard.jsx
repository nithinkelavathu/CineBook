import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setStats(res.data);
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1>Dashboard</h1>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Movies</h3>
          <p>{stats.totalMovies}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Bookings</h3>
          <p>{stats.totalBookings}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Revenue</h3>
          <p>₹{stats.totalRevenue}</p>
        </div>

        <div style={styles.card}>
          <h3>Today's Revenue</h3>
          <p>₹{stats.dailyRevenue || 0}</p>
        </div>

        <div style={styles.card}>
          <h3>Est. Profit</h3>
          <p>₹{stats.totalProfit?.toFixed(2) || 0}</p>
        </div>
      </div>

      <h2 style={{ marginTop: "40px", color: "black" }}>Revenue Breakdowns</h2>
      <div style={styles.movieList}>
        {stats.revenuePerMovie && Object.entries(stats.revenuePerMovie).map(([title, amount]) => (
          <div key={title} style={styles.movieRow}>
            <span>{title}</span>
            <strong style={{color: "#10b981"}}>₹{amount}</strong>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

const styles = {
  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    flex: 1,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    color: "black",
  },
  movieList: {
    marginTop: "20px",
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    color: "black",
  },
  movieRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    fontSize: "16px",
  },
};

export default AdminDashboard;
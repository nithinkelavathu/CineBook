import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { AuthContext } from "../context/AuthContext";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const { auth } = useContext(AuthContext);

  const fetchBookings = async () => {
    const res = await axios.get(
      "https://cinebook-xypk.onrender.com/api/admin/bookings",
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    setBookings(res.data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    await axios.put(
      `https://cinebook-xypk.onrender.com/api/admin/bookings/${id}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    fetchBookings();
  };

  return (
    <AdminLayout>
      <h1>Manage Bookings</h1>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th>User</th>
            <th>Movie</th>
            <th>Seats</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking.user?.name}</td>
              <td>{booking.movie?.title}</td>
              <td>{booking.seats?.join(", ") || booking.seats}</td>
              <td>₹{booking.total}</td>

              <td>
                <span
                  style={
                    booking.status === "confirmed"
                      ? styles.confirmed
                      : styles.cancelled
                  }
                >
                  {booking.status}
                </span>
              </td>

              <td>
                {booking.status === "confirmed" && (
                  <button
                    style={styles.cancelBtn}
                    onClick={() => cancelBooking(booking._id)}
                  >
                    Cancel
                  </button>
                )}
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
    backgroundColor: "white",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#2563eb",
    color: "white",
  },
  confirmed: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  cancelled: {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  cancelBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AdminBookings;
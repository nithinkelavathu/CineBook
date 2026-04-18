import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "https://cinebook-xypk.onrender.com/api/bookings/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await axios.delete(
        `https://cinebook-xypk.onrender.com/api/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from UI after delete
      setBookings(bookings.filter((b) => b._id !== id));

    } catch (error) {
      console.error(error);
      alert("Failed to cancel booking");
    }
  };

  const today = new Date();

  const upcoming = bookings.filter((b) => {
    if (b.date === "Yesterday") return false;
    const d = new Date(b.date);
    return isNaN(d) ? true : d >= today; // "Today", "Tomorrow" default to upcoming
  });

  const past = bookings.filter((b) => {
    if (b.date === "Yesterday") return true;
    const d = new Date(b.date);
    return !isNaN(d) && d < today;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <h2>Loading your bookings...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🎟 My Bookings</h1>

      <Section
        title="Upcoming Bookings"
        data={upcoming}
        onCancel={handleCancel}
        allowCancel={true}
        navigate={navigate}
      />

      <Section
        title="Past Bookings"
        data={past}
        allowCancel={false}
      />
    </div>
  );
};

const Section = ({ title, data, onCancel, allowCancel, navigate }) => (
  <>
    <h2 style={styles.sectionTitle}>{title}</h2>

    {data.length === 0 ? (
      <p style={{ color: "#aaa" }}>No bookings found</p>
    ) : (
      data.map((b) => (
        <div key={b._id} style={styles.card}>
          <div style={styles.info}>
            <h3 style={styles.movieTitle}>{b.movie?.title || "Movie Name"}</h3>
            <p>{b.theatre}</p>
            <p>{b.date} | {b.time}</p>
            <p>Seats: {b.seats.join(", ")}</p>
            {b.snacks && b.snacks.length > 0 && (
              <p style={{ color: "#fbbf24", fontSize: "14px" }}>
                🍿 Snacks: {b.snacks.map(s => `${s.quantity}x ${s.name}`).join(", ")}
              </p>
            )}
            <p>Total: ₹{b.total}</p>
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>
              Booking ID: {b._id}
            </p>
          </div>

          <div style={styles.actions}>
            {allowCancel && (
              <>
                <button
                  style={styles.snackBtn}
                  onClick={() => navigate("/snacks-selection", { state: { booking: b, fromMyBookings: true } })}
                >
                  ➕ Order Snacks
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => onCancel(b._id)}
                >
                  Cancel Ticket
                </button>
              </>
            )}
          </div>
        </div>
      ))
    )}
  </>
);

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#fff",
    padding: "40px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "40px",
  },
  sectionTitle: {
    marginTop: "30px",
    marginBottom: "20px",
    borderBottom: "1px solid #334155",
    paddingBottom: "10px",
    fontSize: "22px",
    color: "#94a3b8",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "24px",
    marginBottom: "20px",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  info: {
    flex: 1,
  },
  movieTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: "#f8fafc",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  snackBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#10b981",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.2s",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #ef4444",
    backgroundColor: "transparent",
    color: "#ef4444",
    cursor: "pointer",
    transition: "0.2s",
  },
};

export default MyBookings;
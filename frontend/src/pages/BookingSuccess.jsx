import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  if (!booking) {
    return <h2 style={{ textAlign: "center" }}>No Booking Found</h2>;
  }

  // Generate Booking ID
  const bookingId =
    "CBK" + Math.floor(10000 + Math.random() * 90000);

  const handleDownload = () => {
    const snacksText = booking.snacks && booking.snacks.length > 0
      ? `\n      Snacks: ${booking.snacks.map(s => `${s.quantity}x ${s.name}`).join(", ")}`
      : "";

    const ticketData = `
      Booking ID: ${bookingId}
      Movie: ${booking.movie}
      Theatre: ${booking.theatre}
      Date: ${booking.date}
      Time: ${booking.time}
      Seats: ${booking.seats.join(", ")}${snacksText}
      Total: ₹${booking.total}
    `;

    const blob = new Blob([ticketData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "CineBook_Ticket.txt";
    link.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🎉 Booking Confirmed!</h2>
        <p><strong>Booking ID:</strong> {bookingId}</p>
        <p><strong>Movie:</strong> {booking.movie}</p>
        <p><strong>Theatre:</strong> {booking.theatre}</p>
        <p><strong>Date:</strong> {booking.date}</p>
        <p><strong>Time:</strong> {booking.time}</p>
        <p><strong>Seats:</strong> {booking.seats.join(", ")}</p>
        
        {booking.snacks && booking.snacks.length > 0 && (
          <div style={{ margin: "15px 0", padding: "15px", backgroundColor: "#fef3c7", borderRadius: "8px", border: "1px dashed #f59e0b" }}>
            <p style={{ margin: "0 0 5px 0" }}><strong>Snacks Ordered:</strong></p>
            <p style={{ margin: 0, color: "#451a03" }}>{booking.snacks.map(s => `${s.quantity}x ${s.name}`).join(", ")}</p>
            <p style={{ color: "#d97706", fontSize: "14px", marginTop: "10px", fontWeight: "bold" }}>
              🎬 Your snacks will be handed over to you at your seat ({booking.seats.join(", ")}) during the intermission. 🍿
            </p>
          </div>
        )}
        
        <h3>Total Paid: ₹{booking.total}</h3>

        <button onClick={handleDownload} style={styles.button}>
          Download Ticket
        </button>

        <button
          onClick={() => navigate("/user")}
          style={{ ...styles.button, backgroundColor: "#444" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#243b55",
    color: "#fff",
    cursor: "pointer",
  },
};

export default BookingSuccess;
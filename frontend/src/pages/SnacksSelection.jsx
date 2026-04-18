import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const CANTEEN_ITEMS = [
  { name: "Large Popcorn", price: 250, icon: "🍿" },
  { name: "Regular Popcorn", price: 180, icon: "🍿" },
  { name: "Nachos with Salsa", price: 220, icon: "🌮" },
  { name: "Cheese Burger", price: 150, icon: "🍔" },
  { name: "Hotdog", price: 130, icon: "🌭" },
  { name: "Margherita Pizza", price: 300, icon: "🍕" },
  { name: "Coca Cola (Large)", price: 120, icon: "🥤" },
  { name: "Iced Tea", price: 100, icon: "🍹" },
  { name: "Mineral Water", price: 50, icon: "💧" },
  { name: "Chocolate Bar", price: 80, icon: "🍫" },
];

const SnacksSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const isFromMyBookings = location.state?.fromMyBookings;

  const [snacks, setSnacks] = useState(
    CANTEEN_ITEMS.map((item) => ({ ...item, quantity: 0 }))
  );
  const [loading, setLoading] = useState(false);

  // If no booking, shouldn't be here
  if (!booking) {
    return <h2 style={{ color: "white", padding: "40px" }}>No active booking session found!</h2>;
  }

  const handleSnackChange = (index, delta) => {
    const updated = [...snacks];
    const newQuantity = updated[index].quantity + delta;
    if (newQuantity >= 0) {
      updated[index].quantity = newQuantity;
      setSnacks(updated);
    }
  };

  const totalCost = snacks.reduce((sum, snack) => sum + snack.price * snack.quantity, 0);

  const handleSkip = () => {
    // Skip snacks, go straight to success page or back to bookings
    if (isFromMyBookings) {
      navigate("/my-bookings");
    } else {
      navigate("/booking-success", { state: booking });
    }
  };

  const handlePayment = async () => {
    if (totalCost === 0) {
      handleSkip();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Store selected snacks temporarily for the processing page
      const selectedSnacks = snacks.filter((s) => s.quantity > 0);
      sessionStorage.setItem("pendingSnacks", JSON.stringify({
        snacks: selectedSnacks,
        snacksCost: totalCost
      }));

      // 1. Create Stripe Checkout Session for Snacks
      const res = await axios.post(
        `http://localhost:5000/api/bookings/${booking._id}/snacks/create-checkout-session`,
        {
          total: totalCost,
          bookingId: booking._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2. Redirect to Stripe
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Snacks Stripe Error:", error);
      alert("Failed to initiate snacks payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>CineBook Canteen</h1>
      <p style={styles.subtitle}>
        Your ticket is secured! Want to add some snacks for the show? Grab them now and skip the queue!
      </p>

      <div style={styles.grid}>
        {snacks.map((snack, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.icon}>{snack.icon}</div>
            <h3 style={styles.name}>{snack.name}</h3>
            <p style={styles.price}>₹{snack.price}</p>

            <div style={styles.qtyControls}>
              <button style={styles.qtyBtn} onClick={() => handleSnackChange(idx, -1)}>-</button>
              <span style={styles.qty}>{snack.quantity}</span>
              <button style={styles.qtyBtn} onClick={() => handleSnackChange(idx, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footerPanel}>
        <div style={styles.footerInfo}>
          <p style={styles.footerTotal}>Snacks Total: <span style={{color: "#10b981"}}>₹{totalCost}</span></p>
        </div>
        <div style={styles.footerActions}>
          <button style={styles.skipBtn} onClick={handleSkip} disabled={loading}>
            Skip & View Ticket
          </button>
          <button 
            style={styles.payBtn} 
            onClick={totalCost > 0 ? handlePayment : handleSkip} 
            disabled={loading}
          >
            {loading ? "Processing..." : totalCost > 0 ? `Pay ₹${totalCost} for Snacks` : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#0f172a",
    color: "#fff",
    minHeight: "100vh",
    padding: "40px",
    paddingBottom: "120px",
    textAlign: "center",
  },
  heading: {
    fontSize: "36px",
    color: "#f43f5e",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "16px",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    border: "1px solid #334155",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "10px",
  },
  name: {
    fontSize: "18px",
    marginBottom: "5px",
  },
  price: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  qtyControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    backgroundColor: "#0f172a",
    padding: "5px 15px",
    borderRadius: "20px",
  },
  qtyBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
  },
  qty: {
    fontSize: "18px",
    fontWeight: "bold",
    width: "20px",
  },
  footerPanel: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#1e293b",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #334155",
    boxShadow: "0 -4px 15px rgba(0,0,0,0.5)",
  },
  footerInfo: {
    textAlign: "left",
  },
  footerTotal: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
  },
  footerActions: {
    display: "flex",
    gap: "15px",
  },
  skipBtn: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "1px solid #64748b",
    color: "#cbd5e1",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  payBtn: {
    padding: "12px 30px",
    backgroundColor: "#f43f5e",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default SnacksSelection;
